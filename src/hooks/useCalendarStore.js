import { useDispatch, useSelector } from 'react-redux';
import { onAddNewEvent, onDeleteEvent, onLoadEvents, onSetActiveEvent, onUpdateEvent } from '../store';
import { calendarApi } from '../api';
import { convertEventsToDateEvents } from '../helpers/convertEventsToDateEvents';


export const useCalendarStore = () => {

   const dispatch = useDispatch();   
   const { events, activeEvent } = useSelector( state => state.calendar);
   const { user } = useSelector( state => state.auth);

   const setActiveEvent = ( calendarEvent ) => {
      dispatch( onSetActiveEvent( calendarEvent ) )
   }

   const startSavingEvent = async( calendarEvent ) => {
      //TODO: Llegar al backend

      //Todo bien
      if (calendarEvent._id){
         //Actualizando
         dispatch( onUpdateEvent( {...calendarEvent } ));
      }else{
         //Creando
         const { data } = await calendarApi.post('/events', calendarEvent);
         dispatch( onAddNewEvent({ ...calendarEvent, id: data.evento.id, user }) );
      }

   }

   const startDeletingEvent = () => {
      //TODO: llegar al backend
      dispatch( onDeleteEvent() );
   }

   const startLoadingEvents = async() => {
      try {

         const { data } = await calendarApi.get('/events');
         const events = convertEventsToDateEvents( data.eventos );
         dispatch( onLoadEvents( events ) );
         
         
      } catch (error) {
         console.log('Error Cargando Eventos');
         console.log(error);
         
      }
   }


  return {
        //* Propiedades
        events,
        activeEvent,
        hasEventSelected: !!activeEvent,

        //* Metodos
        setActiveEvent,
        startSavingEvent,
        startDeletingEvent,
        startLoadingEvents,
  }
    
}
