import React from 'react'
import {Phone,Mail, GitHub, LinkedIn, YouTube, Instagram} from '@mui/icons-material'
import '../componentStyles/Footer.css'
function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                
                <div className='footer-section contact'>
                    <h3>Contact Us</h3>
                    <p><Phone/> Phone:+789456123</p>
                    <p><Mail/> Email:prasanngdhupad@gmail.com</p>
                    
                </div>

                <div className="footer-section social">
                    <h3>Follow me</h3>
                    <div className='social-links'>
                        <a href="" target="_blank">
                            <GitHub className='social-icon'/>
                        </a>
                        <a href="" target="_blank">
                            <LinkedIn className='social-icon'/>
                        </a>
                        <a href="" target="_blank">
                            <YouTube className='social-icon'/>
                        </a>
                        <a href="" target="_blank">
                            <Instagram className='social-icon'/>
                        </a>
                    </div>
                </div>

                <div className="footer-section about">
                    <h3>About</h3>
                    <p>Providing web development tutorials and courses to help you grow your skills</p>
                </div>

            </div>

            <div className="footer-bottom">
                <p>&copy; 2025 PrasannCoding . All rights reserved</p>
            </div>
        </footer>
    )
}

export default Footer
