import { authSlice } from "../../src/store";
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { useAuthStore } from "../../src/hooks";
import { act, renderHook, waitFor } from "@testing-library/react";
import { initialState, notAuthenticatedState } from "../fixtures/authState";
import { testUserCredentials } from "../fixtures/testUser";
import { calendarApi } from "../../src/api";


describe('Pruebas en useAuthStore', () => { 

    beforeEach( () => localStorage.clear());

    const getMockStore = ( initialState ) => {
        return configureStore({
            reducer: {
                auth: authSlice.reducer 
            },
            preloadedState: {
                auth: { ...initialState }
            },
        })
    }

    test('Debe de regresar los valores por defecto', () => { 
        
        const mockStore = getMockStore({ ...initialState });  
            
        const { result } = renderHook( () => useAuthStore(), { 
                wrapper: ({children}) => <Provider store={ mockStore }>{children}</Provider>
        });

        expect( result.current ).toEqual({
            errorMessage: undefined,
            status: 'checking',
            user: {},
            checkAuthToken: expect.any(Function),
            startLogin: expect.any(Function),
            startRegister: expect.any(Function),
            startLogout: expect.any(Function),
        });

     });
     
     test('startLogin debe de realizar el login correctamente', async() => { 
        
         
         const mockStore = getMockStore({ ...notAuthenticatedState });
         const { result } = renderHook( () => useAuthStore(), { 
            wrapper: ({children}) => <Provider store={ mockStore }>{children}</Provider>
         });

         await act( async() => {
            await result.current.startLogin( testUserCredentials )
         });

         const { errorMessage, status, user } = result.current;
         expect({ errorMessage, status, user  }).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: { name: 'Test User', uid: '64b09a80dd6ae47ff2a0c525' },
         });

         expect( localStorage.getItem('token')).toEqual(expect.any(String));
         expect( localStorage.getItem('token-init-date')).toEqual(expect.any(String));
        
     });

     test('startLogin debe de fallar la autenticacion', async() => { 
        
         const mockStore = getMockStore({ ...notAuthenticatedState });
         const { result } = renderHook( () => useAuthStore(), { 
            wrapper: ({children}) => <Provider store={ mockStore }>{children}</Provider>
         });

         await act( async() => {
            await result.current.startLogin({ email: 'algo@google.com', password: '1234566'});
         });

         const { errorMessage, status, user } = result.current;
         
         expect( localStorage.getItem('token')).toBe(null);
         
         expect( { errorMessage, status, user } ).toEqual({
            errorMessage: expect.any(String),
            status: 'not-authenticated',
            user: {}
         });

         await waitFor(
            () => expect(result.current.errorMessage).toBe(undefined)
         );

    });

    test('startRegister debe de crear un usuario', async() => { 
      
        const newUser = { email: 'algo@google.com', password: '1234566', name: 'Test User 2'};
        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook( () => useAuthStore(), { 
            wrapper: ({children}) => <Provider store={ mockStore }>{children}</Provider>
         });

         const spy = jest.spyOn( calendarApi, 'post').mockReturnValue({
            data: {
                ok: true,
                uid: '12345678',
                name: 'Test User',
                token: 'Algun token'
            }
         });

        await act( async() => {
            await result.current.startRegister( newUser );
         });

         const { errorMessage, status, user } = result.current
         expect({ errorMessage, status, user }).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: { name: 'Test User', uid: '12345678' }
         });

         spy.mockRestore();

    });

    test('startRegister debe de fallar la creacion un usuario', async() => { 
      
       
        const mockStore = getMockStore({ ...notAuthenticatedState });
        const { result } = renderHook( () => useAuthStore(), { 
            wrapper: ({children}) => <Provider store={ mockStore }>{children}</Provider>
         });

     
        await act( async() => {
            await result.current.startRegister( testUserCredentials );
         });

         const { errorMessage, status, user } = result.current
         expect({ errorMessage, status, user }).toEqual({
            errorMessage: 'Un usuario existe con ese correo',
            status: 'not-authenticated',
            user: {},
         })
    });

    test('checkAuthToken debe de fallar si no hay token', async() => { 
      
        const mockStore = getMockStore({ ...initialState });
        const { result } = renderHook( () => useAuthStore(), { 
            wrapper: ({children}) => <Provider store={ mockStore }>{children}</Provider>
         });

        // console.log('token', localStorage.getItem('token'));
     
        await act( async() => {
            await result.current.checkAuthToken();
         });

         const { errorMessage, status, user } = result.current
         expect({ errorMessage, status, user }).toEqual({
            errorMessage: undefined,
            status: 'not-authenticated',
            user: {}
         });
     
    });

    test('checkAuthToken debe de autenticar el usuario hay un token', async() => { 
        
        const { data } = await calendarApi.post('/auth', testUserCredentials);  
        localStorage.setItem('token', data.token);

        const mockStore = getMockStore({ ...initialState });
        const { result } = renderHook( () => useAuthStore(), { 
            wrapper: ({children}) => <Provider store={ mockStore }>{children}</Provider>
         });

        // console.log('token', localStorage.getItem('token'));
     
        await act( async() => {
            await result.current.checkAuthToken();
         });

         const { errorMessage, status, user } = result.current
         expect({ errorMessage, status, user }).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: { name: 'Test User', uid: '64b09a80dd6ae47ff2a0c525' }
         }); 
    });




 });