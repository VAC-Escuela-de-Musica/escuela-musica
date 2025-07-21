import { useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();

  /**
   * Este mensaje de error, está pensado para los desarrolladores.
   * En un entorno de producción, no se debería mostrar este mensaje o almenos
   * no de esta forma.
   */


  return (
    <div>
      <h1>Oops!</h1>
      <p>Sorry, un error inesperado ha ocurrido.</p>
      <p>Status: {error?.status}</p>
      <p>Status Text: {error?.statusText}</p>
      <p>Message: {error?.message ? error.message : "No message"}</p>
    </div>
  );
};

export default ErrorPage;
