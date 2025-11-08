import React from 'react';
import './Navbar.css';

export default function Navbar() {
    return (
        <nav className="navbar">
            <h1>Navigation</h1>
            <ul>
                <li>Dashboard</li>
                <li>Pets</li>
                <li>Appointmets</li>
                <li>Medication</li>
            </ul>
        </nav>
    )
}