import SubirMultiplesMateriales from '../components/SubirMultiplesMateriales';

/**
 * Página para subir materiales
 */
const UploadPage = () => {
  return (
    <div>
      <h2 style={{ 
        marginBottom: '2rem', 
        color: '#2c3e50',
        fontSize: '2rem',
        fontWeight: 'bold'
      }}>
        📤 Subir Materiales
      </h2>
      <SubirMultiplesMateriales />
    </div>
  );
};

export default UploadPage;
