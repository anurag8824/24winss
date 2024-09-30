import axios from 'axios'
import { useHistory } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import Header from '../Components/Header'
import css from '../css/Pan.module.css'

export default function Aadhar() {
    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
    const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
    const nodeMode = process.env.NODE_ENV;
    if (nodeMode === "development") {
      var baseUrl = beckendLocalApiUrl;
    } else {
      baseUrl = beckendLiveApiUrl;
    }

    const history = useHistory()

    const [frontLoaded, setfrontLoaded] = useState(null)
    const [backLoaded, setbackLoaded] = useState(null)
    const [Name, setName] = useState()
    const [Number, setNumber] = useState()
    const [DOB, setDob] = useState()

    const handleSubmitdata = (e) => {

        e.preventDefault();
       
        const formData = new FormData();

        formData.append("Name", Name);
        formData.append("Number", Number);
        formData.append("DOB", DOB);
        formData.append("front", frontLoaded);
        formData.append("back", backLoaded);

        if (frontLoaded&&backLoaded) {
            const access_token = localStorage.getItem('token')
            const headers = {
                Authorization: `Bearer ${access_token}`,
            }

            axios.post(baseUrl+`aadharcard`, formData, { headers })
                .then((res) => {
                    
                    history.push("/")

                }).catch((e) => {
                
                })
        }
        else{
            alert('please fill all field')
        }



    }


    useEffect(() => {
        const frontPhoto = document.getElementById('frontPhoto');
        frontPhoto.onchange = e => {
            const [file] = frontPhoto.files;
            setfrontLoaded(file)
        }
        const backPhoto = document.getElementById('backPhoto');
        backPhoto.onchange = e => {
            const [file] = backPhoto.files;
            setbackLoaded(file)
        }
    }, [])
    return (
        <>
            <form className="leftContainer bg-white" style={{ height: '100vh' }} onSubmit={handleSubmitdata} encType="multipart/form-data">
                <div><Header /></div>
                <div className={css.main_area} style={{ paddingTop: '60px' }}>
                    <div className="p-4">
                        <h5 className="text-center" style={{ fontSize: '1.35rem' }}>
                            Update Your Aadhar Card
                        </h5>
                        <div className={`text-center ${css.font_7}`}>
                            Please update your
                            <b>
                                correct aadhar-card
                            </b>
                            , as we will cut TDS (Tax Deducted at Source).
                        </div>
                        <div className={css.divider_x}></div>
                        <div className={`${css.kyc_doc_input} mt-5`}>
                            <input type="text"
                                name="Name"
                                placeholder='enter name'
                                onChange={(e) => setName(e.target.value)} required
                            />
                            <div className={css.label}>
                                Full Name
                            </div>
                        </div>
                        <div className={`${css.kyc_doc_input} mt-5`}>
                            <input type="Number"
                                name="Number"
                                placeholder='enter number'
                                onChange={(e) => setNumber(e.target.value)} required />
                            <div className={css.label}>
                                Aadhar Card Number:
                            </div>
                        </div>
                        <div className={`${css.kyc_doc_input} mt-5`}>
                            <div className={css.label}>
                                Date of Birth
                            </div>
                            <input id="dob" name="DOB" max="2004-05-05" label="Date of Birth" type="string"
                                placeholder='enter dob'
                                onChange={(e) => setDob(e.target.value)} required
                            />
                        </div>
                        <div className={`${css.doc_upload} mt-5`}>
                            <input id="frontPhoto" name="frontPhoto" type="file" accept="image/*" required />
                            {!frontLoaded && <div className="cxy flex-column position-absolute ">
                                <img src="https://hiplay.in/images/file-uploader-icon.png" width="17px" alt="" className="snip-img" />
                                <div className={`${css.sideNav_text} mt-2`}>
                                    Upload front Photo of your Aadhar Card.
                                </div>
                            </div>}
                            {frontLoaded && <div className={css.uploaded}>
                                <img src="https://hiplay.in/images/file-icon.png" width="26px" alt="" style={{ marginRight: '20px' }} />
                                <div className="d-flex flex-column" style={{ width: '80%' }}>
                                    <div className={css.name}>{frontLoaded.name}</div>
                                    <div className={css.size}>{(frontLoaded.size / 1024 / 1024).toFixed(2)} MB</div>
                                </div>
                                <div className="image-block">
                                    <img src="https://hiplay.in/images/global-cross.png" width="10px" alt="" onClick={() => setfrontLoaded(null)} />
                                </div>
                            </div>}
                        </div>
                        <div className={`${css.doc_upload} mt-5`}>
                            <input id="backPhoto" name="backPhoto" type="file" accept="image/*" required />
                            {!backLoaded && <div className="cxy flex-column position-absolute ">
                                <img src="https://hiplay.in/images/file-uploader-icon.png" width="17px" alt="" className="snip-img" />
                                <div className={`${css.sideNav_text} mt-2`}>
                                    Upload back Photo of your Aadhar Card.
                                </div>
                            </div>}
                            {backLoaded && <div className={css.uploaded}>
                                <img src="https://hiplay.in/images/file-icon.png" width="26px" alt="" style={{ marginRight: '20px' }} />
                                <div className="d-flex flex-column" style={{ width: '80%' }}>
                                    <div className={css.name}>{backLoaded.name}</div>
                                    <div className={css.size}>{(backLoaded.size / 1024 / 1024).toFixed(2)} MB</div>
                                </div>
                                <div className="image-block">
                                    <img src="https://hiplay.in/images/global-cross.png" width="10px" alt="" onClick={() => setbackLoaded(null)} />
                                </div>
                            </div>}
                        </div>

                        <div style={{ paddingBottom: '80px' }} className="">
                        </div>
                        <div className={css.refer_footer}>
                            <input className={`${css.refer_button} ${css.cxy} w-100 ${css.bg_secondary} snip-button`} type="submit" />


                        </div>
                    </div>
                </div>

                <div className='rightContainer'></div>
            </form>
        </>
    )
}
