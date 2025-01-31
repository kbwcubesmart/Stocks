import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Login.css'; // Import the CSS for styling

const Login = () => {
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); 
    const handleLogin = (e) => {
        e.preventDefault();
        setError('');  

        
        const validUsername = 'bwcubes';  
        const validPassword = 'stock';

       
        if (username === validUsername && password === validPassword) {
            console.log('Login successful');
            navigate('/stocktable');  
        } else {
            setError('Invalid username or password');  
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label  className="label1" >Username</label>  
                        <input 
                            type="text"
                            className="input1"  
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label  className="label1" >Password</label>
                        <input 
                            type="password" 
                            className="input1"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className="login-button">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
