'use client';

import React, { useEffect, useState } from 'react';
import styles from './InicioPage.module.css';

const InicioPage = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [presupuesto, setPresupuesto] = useState(0);
    const [gasto, setGasto] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/data');
                const data = await response.json();

                setOrdenes(data.ordenes);
                setPresupuesto(data.presupuesto);
                setGasto(data.gasto);
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

            {/* Últimas órdenes de compra */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Últimas Órdenes de Compra</h2>
                <ul className={styles.list}>
                    {(ordenes || []).map((orden, index) => (
                        <li key={index} className={styles.listItem}>
                            {orden.descripcion} - ${orden.monto}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Presupuesto total del departamento */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Presupuesto Total del Departamento</h2>
                <p className={styles.text}>${presupuesto}</p>
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
