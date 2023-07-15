import { authSlice } from "../../src/store";
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { useAuthStore } from "../../src/hooks";
import { act, renderHook } from "@testing-library/react";
import { initialState } from "../fixtures/authState";


describe('Pruebas en useAuthStore', () => { 

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



 });