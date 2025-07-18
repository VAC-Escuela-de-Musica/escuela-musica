import ListaMateriales from '../components/ListaMateriales';

/**
 * Página del Dashboard principal - Lista de materiales
 */
const DashboardPage = () => {
  return (
    <div>
      <h2 style={{ 
        marginBottom: '2rem', 
        color: '#2c3e50',
        fontSize: '2rem',
        fontWeight: 'bold'
      }}>
        📚 Materiales Educativos
      </h2>
      <ListaMateriales />
    </div>
  );
};

export default DashboardPage;
