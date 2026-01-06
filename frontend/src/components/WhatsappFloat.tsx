import React from 'react';
import styles from './WhatsappFloat.module.css';

const WhatsappFloat = () => {
    return (
        <a
            href="https://wa.me/573226430243?text=Hola%20quiero%20información"
            className={styles.whatsappFloat}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
        >
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className={styles.whatsappIcon}
            />
        </a>
    );
};

export default WhatsappFloat;
