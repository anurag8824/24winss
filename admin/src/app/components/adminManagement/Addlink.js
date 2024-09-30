import React, { useState } from 'react';
import axios from 'axios';



const LinkForm = () => {
    
    const beckendLocalApiUrl = process.env.REACT_APP_BACKEND_LOCAL_API;
    const beckendLiveApiUrl = process.env.REACT_APP_BACKEND_LIVE_API;
    const nodeMode = process.env.NODE_ENV;
    if (nodeMode === "development") {
      var baseUrl = beckendLocalApiUrl;
    } else {
      baseUrl = beckendLiveApiUrl;
    }
    
  const [formData, setFormData] = useState({
    whatsapp_link: '',
    facebook_link: '',
    telegram_link: '',
    carousel_link: '',
    carousel_link_1:'',
    carousel_link_2:'',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(baseUrl+`add-link`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        alert('Links submitted successfully!');
      } else {
        alert('Failed to submit links.');
      }
    } catch (error) {
      alert('Error submitting links.');
    }
  };

  return (
      <>
      <h4> Add your Links </h4>
    <form onSubmit={handleSubmit}>
      <div>
        <label>WhatsApp Link:</label>
        <input
          type="text"
          name="whatsapp_link"
          value={formData.whatsapp_link}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Facebook Link:</label>
        <input
          type="text"
          name="facebook_link"
          value={formData.facebook_link}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Telegram Link:</label>
        <input
          type="text"
          name="telegram_link"
          value={formData.telegram_link}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Carousel Link 1 :</label>
        <input
          type="text"
          name="carousel_link"
          value={formData.carousel_link}
          onChange={handleChange}
        />
      </div>
       <div>
        <label>Carousel Link 2:</label>
        <input
          type="text"
          name="carousel_link_1"
          value={formData.carousel_link_1}
          onChange={handleChange}
        />
      </div>
       <div>
        <label>Carousel Link 3:</label>
        <input
          type="text"
          name="carousel_link_2"
          value={formData.carousel_link_2}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Submit</button>
    </form>
    </>
  );
};

export default LinkForm;
