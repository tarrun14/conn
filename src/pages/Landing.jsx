import { Link, useNavigate } from 'react-router-dom';
import './Landing.css'

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="home">

            <nav className="landing-navbar">
                <Link to="/" className="landing-brand">
                    <img src="/assests/logo-dark.png" alt="Brain Logo" />
                    <span className="brand-text">Connect</span>
                </Link>
            </nav>

            <section className="hero">
                <div className="hero-content animate-slideUp">
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
                        <img 
                            src="/assests/logo-dark.png" 
                            alt="Brain Logo" 
                            className="hero-logo-large" 
                            style={{marginBottom: '0'}}
                        />
                    </div>
                    <h1 className="hero-title">Welcome to <span className="highlight">Connect</span></h1>
                    <p className="hero-tagline">
                        A collaborative platform for developers to showcase innovations, crowdsource solutions, and build project-driven communities that turn shared ideas into finished products.
                    </p>

                    <div className="hero-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/login")}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="features-grid">

                    <div className="feature-card">
                        <span className="feature-icon">💬</span>
                        <h3>Learn & Discuss</h3>
                        <p>Ask questions, share ideas, and learn from real experiences.</p>
                    </div>

                    <div className="feature-card">
                        <span className="feature-icon">🤝</span>
                        <h3>Collaborate</h3>
                        <p>Work with like-minded people to build and improve products.</p>
                    </div>

                    <div className="feature-card">
                        <span className="feature-icon">🚀</span>
                        <h3>Grow Projects</h3>
                        <p>Showcase your ideas, get feedback, and evolve faster.</p>
                    </div>

                </div>
            </section>

        </div>
    );
};

export default Landing;