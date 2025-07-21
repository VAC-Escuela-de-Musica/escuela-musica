import React, { useState, useEffect } from 'react';
import messagingService from '../services/messagingService.js';

const WhatsAppConfig = () => {
  const [status, setStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');

  // Cargar estado inicial
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Frontend: Cargando estado...');
      const response = await messagingService.getWhatsAppWebStatus();
      console.log('📊 Frontend: Estado recibido:', response);
      
      if (response.success) {
        setStatus(response.data);
        console.log('✅ Frontend: Estado configurado');
        
        // Si hay código QR disponible, cargarlo también
        if (response.data.qrCode && !qrCode) {
          console.log('📱 Frontend: QR encontrado en estado, configurando...');
          setQrCode(response.data.qrCode);
          setQrCodeImage(response.data.qrCodeImage);
          console.log('🖼️ Frontend: Imagen QR configurada desde estado:', !!response.data.qrCodeImage);
        }
      }
    } catch (error) {
      console.error('❌ Frontend: Error cargando estado:', error);
      setMessage('Error cargando estado de WhatsApp Web');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWhatsApp = async () => {
    try {
      setIsLoading(true);
      setMessage('Inicializando WhatsApp Web...');
      
      const response = await messagingService.initializeWhatsAppWeb();
      if (response.success) {
        setMessage('WhatsApp Web inicializado. Revisa la consola del servidor para el código QR.');
        await loadStatus();
      } else {
        setMessage('Error inicializando WhatsApp Web: ' + response.message);
      }
    } catch (error) {
      console.error('Error inicializando:', error);
      setMessage('Error inicializando WhatsApp Web');
    } finally {
      setIsLoading(false);
    }
  };

  const getQRCode = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Frontend: Obteniendo código QR...');
      const response = await messagingService.getWhatsAppWebQR();
      console.log('📱 Frontend: Respuesta completa recibida:', response);
      console.log('📱 Frontend: response.success:', response.success);
      console.log('📱 Frontend: response.data:', response.data);
      console.log('📱 Frontend: response.data?.qrCode:', !!response.data?.qrCode);
      console.log('📱 Frontend: response.data?.qrCodeImage:', !!response.data?.qrCodeImage);
      
      if (response.success && response.data?.qrCode) {
        console.log('✅ Frontend: QR disponible, configurando estado...');
        setQrCode(response.data.qrCode);
        setQrCodeImage(response.data.qrCodeImage);
        console.log('🖼️ Frontend: Imagen QR configurada:', !!response.data.qrCodeImage);
        console.log('🖼️ Frontend: Tamaño de imagen QR:', response.data.qrCodeImage?.length || 0);
        setMessage('Código QR generado. Escanea con WhatsApp para autenticar.');
      } else {
        console.log('❌ Frontend: No hay QR disponible');
        console.log('❌ Frontend: response.success:', response.success);
        console.log('❌ Frontend: response.data:', response.data);
        setMessage(response.data?.message || 'No hay código QR disponible');
      }
    } catch (error) {
      console.error('❌ Frontend: Error obteniendo QR:', error);
      setMessage('Error obteniendo código QR');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testPhone || !testMessage) {
      setMessage('Por favor completa el número y mensaje de prueba');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('Enviando mensaje de prueba...');
      
      const response = await messagingService.sendWhatsAppMessage(testPhone, testMessage);
      if (response.success) {
        setMessage('✅ Mensaje de prueba enviado exitosamente!');
        setTestPhone('');
        setTestMessage('');
      } else {
        setMessage('❌ Error enviando mensaje: ' + response.message);
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setMessage('Error enviando mensaje de prueba');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!status) return 'text-gray-500';
    if (status.ready) return 'text-green-600';
    if (status.initialized) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusText = () => {
    if (!status) return 'Desconocido';
    if (status.ready) return 'Conectado y Listo';
    if (status.initialized) return 'Inicializado (Necesita autenticación)';
    return 'No inicializado';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📱 Configuración de WhatsApp Web</h2>
        <p className="text-gray-600">
          Configura WhatsApp Web para enviar mensajes reales de WhatsApp sin costos adicionales.
        </p>
      </div>

      {/* Estado Actual */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-4">Estado Actual</h3>
        <div className="flex items-center gap-4">
          <div className={`text-lg font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
          <button
            onClick={loadStatus}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            🔄 Actualizar
          </button>
        </div>
        
        {status && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded border">
              <div className="font-medium">Inicializado:</div>
              <div className={status.initialized ? 'text-green-600' : 'text-red-600'}>
                {status.initialized ? '✅ Sí' : '❌ No'}
              </div>
            </div>
            <div className="bg-white p-4 rounded border">
              <div className="font-medium">Listo:</div>
              <div className={status.ready ? 'text-green-600' : 'text-red-600'}>
                {status.ready ? '✅ Sí' : '❌ No'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">🚀 Inicializar WhatsApp Web</h3>
          <p className="text-gray-600 mb-4">
            Inicia el servicio de WhatsApp Web. Esto generará un código QR que deberás escanear.
          </p>
          <button
            onClick={initializeWhatsApp}
            disabled={isLoading || (status && status.initialized)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? '⏳ Inicializando...' : '🚀 Inicializar WhatsApp Web'}
          </button>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">📱 Obtener Código QR</h3>
          <p className="text-gray-600 mb-4">
            Obtiene el código QR para autenticar WhatsApp Web desde tu teléfono.
          </p>
          <button
            onClick={getQRCode}
            disabled={isLoading || !status?.initialized}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? '⏳ Obteniendo...' : '📱 Obtener Código QR'}
          </button>
        </div>
      </div>

      {/* Código QR */}
      {qrCode && (
        <div className="bg-yellow-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">📱 Código QR para Autenticación</h3>
          <div className="bg-white p-4 rounded border">
            <p className="text-sm text-gray-600 mb-4">
              <strong>Instrucciones:</strong>
            </p>
            <ol className="list-decimal list-inside text-sm text-gray-600 mb-4 space-y-1">
              <li>Abre WhatsApp en tu teléfono</li>
              <li>Ve a Configuración → Dispositivos Vinculados</li>
              <li>Escanea el código QR que aparece abajo</li>
              <li>Confirma la vinculación en tu teléfono</li>
            </ol>
            
            {/* Debug info */}
            <div className="bg-blue-50 p-3 rounded mb-4 text-xs">
              <strong>Debug:</strong> qrCode: {!!qrCode}, qrCodeImage: {!!qrCodeImage}, 
              Tamaño imagen: {qrCodeImage?.length || 0} caracteres
            </div>
            
            {/* Imagen QR */}
            {qrCodeImage && (
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <img 
                    src={qrCodeImage} 
                    alt="Código QR WhatsApp" 
                    className="w-64 h-64"
                    style={{ imageRendering: 'pixelated' }}
                    onLoad={() => console.log('🖼️ Frontend: Imagen QR cargada correctamente')}
                    onError={(e) => console.error('❌ Frontend: Error cargando imagen QR:', e)}
                  />
                </div>
              </div>
            )}
            {!qrCodeImage && qrCode && (
              <div className="text-center text-red-600 mb-4">
                ⚠️ Imagen QR no disponible, pero código QR sí
              </div>
            )}
            
            {/* Código QR como texto (fallback) */}
            <div className="bg-gray-100 p-3 rounded font-mono text-xs break-all">
              {qrCode}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 <strong>Nota:</strong> Escanea la imagen QR de arriba con WhatsApp para autenticar.
            </p>
          </div>
        </div>
      )}

      {/* Prueba de Mensaje */}
      <div className="bg-purple-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">🧪 Prueba de Mensaje</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Teléfono
            </label>
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+34612345678"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje de Prueba
            </label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Mensaje de prueba desde GPS"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={sendTestMessage}
          disabled={isLoading || !status?.ready || !testPhone || !testMessage}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {isLoading ? '⏳ Enviando...' : '📤 Enviar Mensaje de Prueba'}
        </button>
      </div>

      {/* Mensajes */}
      {message && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-blue-800">{message}</p>
        </div>
      )}

      {/* Información Adicional */}
      <div className="bg-gray-50 p-6 rounded-lg mt-6">
        <h3 className="text-lg font-semibold mb-4">ℹ️ Información Importante</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-600 mb-2">✅ Ventajas</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 100% Gratuito</li>
              <li>• Mensajes reales</li>
              <li>• Desde tu número personal</li>
              <li>• Sin límites de envío</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-orange-600 mb-2">⚠️ Consideraciones</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Necesita sesión activa</li>
              <li>• Un número por servidor</li>
              <li>• Dependiente de WhatsApp Web</li>
              <li>• Requiere autenticación inicial</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConfig; 