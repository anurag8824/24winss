import axios from 'axios';
import React, { useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Rightcontainer from '../Components/Rightcontainer';
import '../css/layout.css';
import '../css/login.css';
import loginss from "./ss.png";

export default function Login() {
    const history = useHistory();

    // State variables
    const [Phone, setPhone] = useState('');
    const [twofactor_code, settwofactor_code] = useState('');
    const [otp, setOtp] = useState(false);
    const [secretCode, setSecretCode] = useState('');
    const [referral, setReferral] = useState(useLocation().pathname.split("/")[2]);
    const [agreeTerms, setAgreeTerms] = useState(false); // New state for the checkbox

    // Handle initial phone number submission
    const handleClick = async (e) => {
        e.preventDefault();

        if (!Phone) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please enter your phone number',
            });
        } else if (Phone.length !== 10) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please enter a valid phone number',
            });
        } else {
            await axios.post(`http://localhost:2024/login`, {
                Phone, referral
            }).then((response) => {
                if (response.data.status === 101) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: response.data.msg,
                    });
                } else if (response.data.status === 200) {
                    setOtp(true);
                    console.log(response.data);
                    setSecretCode(response.data.secret);
                }
            }).catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong',
                });
            });
        }
    }

    // Handle OTP verification
    const verifyOtp = async (e) => {
        e.preventDefault();
        console.log('Verify OTP request');

        if (!Phone) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Please enter your phone number',
            });
        } else if (!agreeTerms) { // Check if the checkbox is not checked
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'You must agree to the terms and conditions to proceed',
            });
        } else {
            await axios.post(`http://localhost:2024/login/finish`, {
                Phone,
                twofactor_code,
                referral,
                secretCode
            }).then((response) => {
                if (response.data.status === 101) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: response.data.msg,
                    });
                } else if (response.data.status === 200) {
                    const token = response.data.token;
                    localStorage.setItem("token", token);
                    window.location.reload(true);
                    setTimeout(() => {
                        history.push("/Games");
                    }, 1000);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong!',
                    });
                }
            }).catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong!',
                });
            });
        }
    }

    // Show error alert for invalid phone number
    const setError = () => {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Invalid Number',
        });
    }

    return (
        <>
            <div className='leftContainer' style={{ minHeight: '100vh' }}>
                <div className="main-area bg-dark">
                    <div style={{ overflowY: 'hidden' }}>
                        <div className="splash-overlay" />
                        <div className="splash-screen animate__bounce infinite ">
                            <figure><img width="100%" src={loginss} alt="" /></figure>
                        </div>
                        <div className="position-absolute w-100 center-xy mx-auto" style={{ top: '30%', zIndex: 9 }}>
                            <div className="d-flex text-white font-15 mb-4">Sign in</div>
                            
                            {/* Mobile Number Field */}
                            <div className="bg-white px-3 cxy flex-column" style={{
                                width: '85%', height: '60px', borderRadius: '5px', marginBottom: '10px'
                            }}>
                                <div className="input-group mb-2" style={{ transition: 'top 0.5s ease 0s', top: '5px' }}>
                                    <div className="input-group-prepend">
                                        <div className="input-group-text" style={{ width: '100px', backgroundColor: '#e9ecef', border: '1px solid #d8d6de' }}>+91</div>
                                    </div>
                                    <input className="form-control" name="mobile" type="tel" placeholder="Mobile number"
                                        onChange={(e) => {
                                            setPhone(e.target.value);
                                            if (e.target.value.length > 10) {
                                                setError(true);
                                            }
                                        }}
                                        style={{ transition: 'all 3s ease-out 0s', borderRadius: "4px" }}
                                    />
                                </div>
                            </div>
                            
                            {/* OTP Field */}
                            {otp && <div className="bg-white px-3 cxy flex-column" style={{
                                width: '85%', height: '60px', borderRadius: '5px', marginTop: "10px", marginBottom: '10px'
                            }}>
                                <div className="input-group mb-2" style={{ transition: 'top 0.5s ease 0s', top: '5px' }}>
                                    <div className="input-group-prepend">
                                        <div className="input-group-text" style={{ width: '100px', backgroundColor: '#e9ecef', border: '1px solid #d8d6de' }}>OTP</div>
                                    </div>
                                    <input className="form-control" name="password" type="tel" placeholder="Enter OTP"
                                        onChange={(e) => settwofactor_code(e.target.value)}
                                        style={{ transition: 'all 3s ease-out 0s', borderRadius: "4px", border: '1px solid #d8d6de' }} />
                                </div>
                            </div>}

                            {/* Checkbox Field */}
                            {otp && <div className="bg-white px-3 cxy flex-column" style={{
                                width: '85%', height: '60px', borderRadius: '5px', marginTop: "10px", padding: '10px',
                                display: 'flex', alignItems: 'center', border: '1px solid #d8d6de', backgroundColor: '#f9f9f9'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <input className="form-check-input" type="checkbox" id="agreeTerms"
                                        checked={agreeTerms}
                                        onChange={(e) => setAgreeTerms(e.target.checked)}
                                        style={{
                                            marginRight: '10px',
                                            borderRadius: '4px',
                                            border: '1px solid #d8d6de',
                                            height: '20px',
                                            width: '20px'
                                        }}
                                    />
                                    <label className="form-check-label" htmlFor="agreeTerms" style={{
                                        color: '#000',
                                        fontSize: '14px',
                                        marginLeft: '25px' // Adjusted margin for better alignment
                                    }}>
                                        I agree to the <Link to="/term-condition" style={{ textDecoration: 'underline', color: '#007bff' }}>Terms & Conditions</Link>
                                    </label>
                                </div>
                            </div>}
                            
                            {/* Continue and Verify Buttons */}
                            {!otp && <button className="Login-button cxy mt-4" onClick={(e) => handleClick(e)}>Continue</button>}
                            {otp && <button className="Login-button cxy mt-4" onClick={(e) => verifyOtp(e)}>Verify</button>}
                        </div>
                        <div className="login-footer">
                            By continuing I agree that 24 win. may store and process my data in accordance with the <Link to="/term-condition">Terms of Use</Link>, <Link to="/PrivacyPolicy">Privacy Policy</Link> and that I am 18 years or older. I am not playing from
                            Assam, Odisha, Nagaland, Sikkim, Meghalaya, Andhra Pradesh, or Telangana.
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
