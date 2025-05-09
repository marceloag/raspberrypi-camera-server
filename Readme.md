# Servidor para camara de Raspberry pi

Este es un servidor simple que permite capturar imágenes con la cámara de un Raspberry Pi y acceder a ellas desde cualquier dispositivo en la misma red.

## Primeros pasos

Asegurarse que el servidor esté en funcionamiento asi como la camara antes de acceder a los endpoints.

```bash
# Verifica que la cámara esté habilitada
sudo raspi-config
# Navega a Interfacing Options > Camera > Yes

# Prueba la cámara
raspistill -o test.jpg
```

## Instalación

```bash
npm install
```

## Uso

```bash
node app.js
OR
npm run dev
```

## Acceso

http://localhost:3000

##Consumir Imagenes desde otro sitio en la red

```javascript
fetch('http://IP-DE-TU-RASPBERRY:3000/capturar')
  .then(response => response.json())
  .then(data => {
    const imgElement = document.createElement('img');
    imgElement.src = data.url;
    document.body.appendChild(imgElement);
  });
```


### Acceso

Una vez que el servidor est  en funcionamiento, podr s acceder a los siguientes endpoints desde cualquier dispositivo en tu red local:

#### Tomar una foto: http://IP-DE-TU-RASPBERRY:3000/capturar

Captura una nueva imagen y devuelve su URL

#### Obtener la última foto: http://IP-DE-TU-RASPBERRY:3000/ultima

Devuelve la URL de la imagen más reciente

#### Listar todas las fotos: http://IP-DE-TU-RASPBERRY:3000/lista

Muestra todas las imágenes disponibles

#### Acceder directamente a una imagen: http://IP-DE-TU-RASPBERRY:3000/images/nombre-de-la-imagen.jpg