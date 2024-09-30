import React from "react";
import { Link } from "react-router-dom";
import Header from "../Components/Header";
import Rightcontainer from "../Components/Rightcontainer";
const Gamerules = () => {
  return (
    <div>
        <div className="leftContainer" style={{minHeight:'100vh',height:'100%'}}>
            
      <div className="m-3 py-5 pt-3 px-3">
        
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <strong>Home</strong>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
             <b> 24 Wins Rules </b>
            </li>
          </ol>
        </nav>
        <div className="row">
          <div className="col-12">
            <h4><strong>Game Rules:</strong></h4>
            <ol className="rules-list">
             
                  <li>
                    यदि दोनों प्लेयर्स ने कोड Join करके गेम प्ले कर लिया हो और दूसरा प्लेयर गोटी ओपन होने के बाद लेफ्ट मरता है तो Opponent प्लेयर पूरा Lose दिया जायेगा
                  </li>
                  <li>यदि दोनों Players गेम प्ले के लिए स्टार्ट करते है एक प्लेयर गेम मे चला गया बल्कि दूसरा प्लेयर गेम मैं नही गया और गेम प्ले हो गया दोनों तरफ से एक प्लेयर की गोटी ओपन हो गई और दूसरा प्लेयर ऑटो Exit है जो ऑटो एग्जिट प्लेयर है वो पूरा लूज़ दिया जायेगा अतः अपना नेट प्रॉब्लम चेक करके खेले ये स्वयं की जिम्मेदारी होगी जायेगा</li>
                  <li>
                    Game समाप्त होने के 10 मिनट के अंदर रिजल्ट डालना आवश्यक है अन्यथा Opponent के रिजल्ट के आधार पर गेम अपडेट कर दिया जायेगा चाहे आप जीते या हारे और इसमें पूरी ज़िम्मेदारी आपकी होगी इसमें बाद में कोई बदलाव नहीं किया जा सकता है ! जायेगा
                  </li>
                
             
              <li>
               	Win होने के बाद आप गलत स्क्रीनशॉट डालते है तो गेम को सीधा Cancel कर दिया जायेगा इसलिए यदि आप स्क्रीनशॉट लेना भूल गए है तो पहले Live Chat में एडमिन को संपर्क करे उसके बाद ही उनके बताये अनुसार रिजल्ट पोस्ट करे !
              </li>
              <li>
            	दोनों प्लेयर की टोकन (काटी) घर से बाहर न आयी हो तो लेफ्ट होकर गेम कैंसिल किया जा सकता है ! [कैंसिल प्रूफ करने के लिए वीडियो आवश्यक होगा] 'कैंसिल' रिजल्ट डालने के बाद गेम प्ले करके जीत जाते है तो उसमे हमारी कोई ज़िम्मेदारी नहीं होगी अतः गेम कैंसिल करने के बाद स्टार्ट न करे अन्यथा वो कैंसिल ही माना जायेगापोस्ट करे !
              </li>
              <li>
                	'कैंसिल' रिजल्ट डालने के बाद गेम प्ले करके जीत जाते है तो उसमे हमारी कोई ज़िम्मेदारी नहीं होगी अतः गेम कैंसिल करने के बाद स्टार्ट न करे अन्यथा वो कैंसिल ही माना जायेगापोस्ट करे !
              </li>
              <li>
               	एक बार रिजल्ट डालने के बाद बदला नहीं जा सकता है इसलिए सोच समझकर रिजल्ट पोस्ट करे गलत रिजल्ट डालने पर पेनल्टी भी लगायी जाएगी चाहे आपने वो गलती से डाला हो या जान भुजकरपोस्ट करे !
              </li>
              <li>
               	Fresh आईडी गेम के मामले में केवल पासा के उपयोग के प्रमाण पर रद्द कर दिया जाएगा गोटी के खुले होने के बावजूद नहीं ? गेम का रिकॉड होना जरूरी है अगर कोई अपनी आईडी का नाम नो फ्रेश कर रका तो नो फ्रेश आईडी ही टेक करे जिनका इंटरेस्ट हो वही टेक करे टेबल को ( इसका अंतिम रिजल्ट एडमिन देगा )जकर
              </li>
              <li>
              	अपनी  KYC सही तरीके से करने के बाद ही आपका विनिंग कैश विड्रोल होगा।ुजकर
              </li>
              <li>
              		अपनी ID को सुरक्षित रखे किसी को OTP ना देवे। हमारे WhatsApp पर संपर्क करे।।ुजकर
              </li>
            </ol>
            <h4><strong>Commission Rates:</strong></h4>
            <ol className="rules-list">
              <li>
               	Battle below 250₹, 5% commission will be charged on battle amount. 250₹ से कम की बैटल, बैटल राशि पर 5% कमीशन लिया जाएगा।ा।
              </li>
              <li>
               	Battle between 250₹ to 500₹, flat 25₹ commission will be charged. 250₹ से 500₹ के बीच बैटल,5% कमीशन लगेगा।
              </li>
              <li>
               	Battle above 500₹, 5% commission will be charged on battle amount. 500₹ से ऊपर की बैटल, बैटल राशि पर 5% कमीशन लिया जाएगा |</li>
               
            </ol>
          </div>
        </div>
      </div>
      </div>
      <div className="rightContainer">
          <Rightcontainer/>
      </div>
    </div>
  );
};
export default Gamerules;