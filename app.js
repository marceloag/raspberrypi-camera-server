const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

// Crear la aplicación Express
const app = express();
const PORT = 3000;

// Directorio donde se guardarán las imágenes
const IMAGES_DIR = path.join(__dirname, 'images');

// Asegurarse de que el directorio de imágenes existe
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  console.log(`Directorio de imágenes creado: ${IMAGES_DIR}`);
}

// Servir archivos estáticos desde el directorio de imágenes
app.use('/images', express.static(IMAGES_DIR));

// Endpoint para tomar una foto
app.get('/capturar', (req, res) => {
  // Nombre para la imagen basado en la fecha y hora actual
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
  const filename = `imagen-${timestamp}.jpg`;
  const imagePath = path.join(IMAGES_DIR, filename);
  
  // Comando para capturar una imagen con raspistill
  const cmd = `fswebcam -r 1280x720 --no-banner ${imagePath}`;
  
  console.log(`Ejecutando: ${cmd}`);
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar raspistill: ${error}`);
      return res.status(500).json({ 
        error: 'Error al capturar la imagen',
        details: error.message
      });
    }
    
    // Construir la URL completa de la imagen
    const imageUrl = `http://${req.headers.host}/images/${filename}`;
    
    console.log(`Imagen capturada: ${imageUrl}`);
    
    // Responder con la URL de la imagen
    res.json({
      mensaje: 'Imagen capturada exitosamente',
      url: imageUrl,
      timestamp: new Date().toISOString()
    });
  });
});

// Endpoint para obtener la última imagen
app.get('/ultima', (req, res) => {
  fs.readdir(IMAGES_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer el directorio de imágenes' });
    }
    
    // Filtrar solo archivos jpg
    const imageFiles = files.filter(file => file.toLowerCase().endsWith('.jpg'));
    
    if (imageFiles.length === 0) {
      return res.status(404).json({ error: 'No hay imágenes disponibles' });
    }
    
    // Ordenar por fecha de modificación (la más reciente primero)
    const latestImage = imageFiles.map(file => {
      return {
        filename: file,
        mtime: fs.statSync(path.join(IMAGES_DIR, file)).mtime
      };
    }).sort((a, b) => b.mtime - a.mtime)[0].filename;
    
    const imageUrl = `http://${req.headers.host}/images/${latestImage}`;
    
    res.json({
      mensaje: 'Última imagen',
      url: imageUrl,
      timestamp: new Date().toISOString()
    });
  });
});

// Endpoint para listar todas las imágenes disponibles
app.get('/lista', (req, res) => {
  fs.readdir(IMAGES_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error al leer el directorio de imágenes' });
    }
    
    // Filtrar solo archivos jpg
    const imageFiles = files.filter(file => file.toLowerCase().endsWith('.jpg'));
    
    // Crear URLs completas para cada imagen
    const imageUrls = imageFiles.map(file => {
      return `http://${req.headers.host}/images/${file}`;
    });
    
    res.json({
      mensaje: 'Lista de imágenes disponibles',
      cantidad: imageUrls.length,
      imagenes: imageUrls
    });
  });
});

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor iniciado en http://0.0.0.0:${PORT}`);
  console.log(`Endpoints disponibles:`);
  console.log(`- http://0.0.0.0:${PORT}/capturar - Toma una nueva foto`);
  console.log(`- http://0.0.0.0:${PORT}/ultima - Obtiene la última foto`);
  console.log(`- http://0.0.0.0:${PORT}/lista - Lista todas las fotos disponibles`);
});