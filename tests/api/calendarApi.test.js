import calendarApi from "../../src/api/calendarApi";

describe('Pruebas en CalendarApi', () => { 

    test('Debe de tener la configuracion por defecto', () => { 
        
        //console.log(calendarApi);
        
        expect( calendarApi.defaults.baseURL ).toBe( process.env.VITE_API_URL )
    
     });

    test('Debe de tener el x-token en el header de todas las peticiones', async() => { 

        localStorage.setItem('token', 'ABC-123-XYZ');
        const res = await calendarApi.get('/auth');

        console.log(res);

      });
  
 });