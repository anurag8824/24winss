import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import Header from '../Components/Header'
import css from '../css/Pan.module.css'
export default function Pan() {
    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
    const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
    const nodeMode = process.env.NODE_ENV;
    if (nodeMode === "development") {
      var baseUrl = beckendLocalApiUrl;
    } else {
      baseUrl = beckendLiveApiUrl;
    }
    // useEffect(() => {
    //         const panPhoto=document.getElementById('panPhoto');
    //         panPhoto.onchange= e=>{
    //             const [file]=panPhoto.files;
    //             console.log(file)
    //         }
    // }, [])

    const history = useHistory()

    const [addhar, setaadhar] = useState({
        Name: "",
        DOB: "",
        Number: "",
        docs: ""
    })

    const handleChange = (e) => {
        setaadhar({
            ...addhar, [e.target.name]: e.target.value
        })
    }

    const handleChangePhoto = (e) => {
        setaadhar({
            ...addhar, docs: e.target.files[0]
        })
    }

    const handleSubmitdata = (e) => {
        e.preventDefault();
        const formData = new FormData();

        formData.append("Name", addhar.Name);
        formData.append("Number", addhar.Number);
        formData.append("DOB", addhar.DOB);
        formData.append("docs", addhar.docs);


        const access_token = localStorage.getItem('token')
        const headers = {
            Authorization: `Bearer ${access_token}`,
        }
        if (addhar.Name && addhar.Number && addhar.docs && addhar.DOB) {
            axios.post(baseUrl+`pancard`, formData, { headers })
                .then((res) => {
                    setaadhar(res.data)
                    history.push("/KYC/update-pan")
                }).catch((e) => {
                    console.log(e);
                })
        } else {
            alert("fill all field")
        }

    }

    return (
        <>
            <form className="leftContainer bg-white" style={{ height: '100vh' }} onSubmit={handleSubmitdata}>
                <div><Header /></div>
                <div className={css.main_area} style={{ paddingTop: '60px' }}>
                    <div className="p-4">
                        <h5 className="text-center" style={{ fontSize: '1.35rem' }}>
                            Update Your Pan Card
                        </h5>
                        <div className={`text-center ${css.font_7}`}>
                            Please update your
                            <b>
                                correct pan-card
                            </b>
                            , as we will cut TDS (Tax Deducted at Source).
                        </div>
                        <div className={css.divider_x}></div>
                        <div className={`${css.kyc_doc_input} mt-5`}>
                            <input type="text"
                                name="Name"
                                value={addhar.Name}
                                onChange={handleChange}

                            />
                            <div className={css.label}>
                                Full Name
                            </div>
                        </div>
                        <div className={`${css.kyc_doc_input} mt-5`}>
                            <input type="text"
                                name="Number"
                                value={addhar.Number}
                                onChange={handleChange}
                            />
                            <div className={css.label}>
                                Pan Card Number:
                            </div>
                        </div>
                        <div className={`${css.kyc_doc_input} mt-5`}>
                            <div className={css.label}>
                                Date of Birth
                            </div>
                            <input id="dob" max="2004-05-05" label="Date of Birth" type="date"
                                name="DOB"
                                value={addhar.DOB}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={`${css.doc_upload} mt-5`}>
                            <input id="panPhoto" type="file" accept="image/*"

                                name="docs"
                                onChange={handleChangePhoto}
                            />
                            <div className="cxy flex-column position-absolute ">
                                <img src={process.env.PUBLIC_URL + '/Images/upload_icon.png'} width="17px" alt="" className="snip-img" />
                                <div className={`${css.sideNav_text} mt-2`}>
                                    Upload Photo of your Pan Card.
                                </div>
                            </div>
                        </div>
                        <div style={{ paddingBottom: '80px' }} className="">
                        </div>
                        <div className={css.refer_footer}>
                            <button className={`${css.refer_button} ${css.cxy} w-100 ${css.bg_secondary} snip-button`}>
                                Complete
                            </button>
                        </div>
                    </div>
                </div>

                <div className='rightContainer'></div>
            </form>
        </>
    )
}
