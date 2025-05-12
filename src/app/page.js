'use client';

import React, { useEffect, useState } from 'react';
import styles from './InicioPage.module.css';

const InicioPage = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [presupuesto, setPresupuesto] = useState(0);
    const [gasto, setGasto] = useState(0);
    const [departamento, setDepartamento] = useState('');
    const [anio, setAnio] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/Inicio_data');
                const data = await response.json();

                setOrdenes(data.ordenes);
                setPresupuesto(data.presupuesto);
                setGasto(data.gasto);
                setDepartamento(data.departamento);
                setAnio(data.anio);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Bienvenido a la Gestión de Bolsas</h1>
            <p className={styles.subtitle}>Esta es la página de inicio de la aplicación.</p>

            {/* Departamento y Año */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Departamento y Año</h2>
                <p className={styles.text}>{departamento} - {anio}</p>
            </div>

            {/* Últimas órdenes de compra */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Últimas Órdenes de Compra</h2>
                <table className={styles.table}>
                    <thead className={styles.tableHeaderRed}>
                        <tr>
                            <th style={{ textAlign: 'left', paddingRight: '20px' }}>Descripción</th>
                            <th style={{ textAlign: 'right' }}>Gasto (€)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(ordenes || []).map((orden, index) => (
                            <tr key={index} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                                <td style={{ textAlign: 'left', paddingRight: '20px' }}>{orden.descripcion}</td>
                                <td style={{ textAlign: 'right' }}>{orden.gasto}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Presupuesto total del departamento */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Presupuesto Total del Departamento</h2>
                <p className={styles.text}>Monto: ${presupuesto?.Monto || 0} - Tipo: {presupuesto?.Tipo_Bolsa || 'Sin Asignar'}</p>
            </div>

            {/* Gasto total del departamento */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Gasto Total del Departamento</h2>
                <p className={styles.text}>${gasto}</p>
            </div>
        </div>
    );
};

export default InicioPage;
