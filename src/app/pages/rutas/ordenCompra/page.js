"use client";

import { useState, useEffect } from 'react';
import React from "react";
import Link from "next/link";

<Link href="/orden-compra"></Link>

export default function OrdenCompraPage() {
  const [formulario, setFormulario] = useState({
    numOrdenCompra: '',
    fecha: '',
    cantidad: '',
    proveedor: '',
    tipoProducto: '',
    comentarios: '',
    numInv: ''
  });
  const [usuario, setUsuario] = useState({
    nombre: 'Juan', 
    rol: 'profesor',
  });
    const [productos, setProductos] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [tipoProductos, setTipoProductos] = useState([]);
    const [numInv, setNumInv] = useState([]);
    const [ordenesCompra, setOrdenesCompra] = useState([]);
  const [ordenCompra, setOrdenCompra] = useState(null);

  const handleChange = (e) => { // Manejo de cambios en inputs
    const { name, value } = e.target; // Desestructuración del evento
    setFormulario(prev => ({ // Actualiza el estado del formulario
      ...prev,  // Mantiene los valores previos
      [name]: value // Actualiza el valor del campo que cambió
    }));
  };


  const handleSubmit = (e) => { // Manejo del envío del formulario
    e.preventDefault(); // Previene el comportamiento por defecto del formulario

    if (usuario.rol !== 'contable' && usuario.rol !== 'jefeDepartamento' && usuario.rol !== 'administrador') { // Verifica el rol del usuario
      // Si el usuario no tiene permiso, muestra un mensaje y no envía el formulario
      alert("No tienes permiso para hacer pedidos.");
      return;
    }

    console.log('Pedido realizado:', formulario);
    alert("Pedido enviado correctamente.");
    setFormulario({ // Resetea el formulario después de enviar
      numOrdenCompra: '',
      fecha: '',
      cantidad: '',
      proveedor: '',
      tipoProducto: '',
      comentarios: '',
      numInv: ''
    });
  };

  return ( // Renderiza el formulario de orden de compra
    <div className="p-8"> 
      <h1 className="text-2xl mb-4">Crear Orden de Compra</h1> 

      <form onSubmit={handleSubmit} className="space-y-4"> 

        <input type="text" name="numOrdenCompra" value={formulario.numOrdenCompra} onChange={handleChange} placeholder="Número de Orden" className="border p-2 w-full" />
        
        <input type="date" name="fecha" value={formulario.fecha} onChange={handleChange} className="border p-2 w-full" />

        <input type="number" name="cantidad" value={formulario.cantidad} onChange={handleChange} placeholder="Cantidad" className="border p-2 w-full" />

        <input type="text" name="proveedor" value={formulario.proveedor} onChange={handleChange} placeholder="Proveedor" className="border p-2 w-full" />

        <select name="tipoProducto" value={formulario.tipoProducto} onChange={handleChange} className="border p-2 w-full">
          <option value="">Tipo de producto</option>
          <option value="fungible">Fungible</option>
          <option value="inventariable">Inventariable</option>
        </select>

        <textarea name="comentarios" value={formulario.comentarios} onChange={handleChange} placeholder="Comentarios" className="border p-2 w-full" rows={4}></textarea>

        <input type="text" name="numInv" value={formulario.numInv} onChange={handleChange} placeholder="Número de inventario (si aplica)" className="border p-2 w-full" />

        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded">Añadir</button>

      </form>
    </div>
  );
}