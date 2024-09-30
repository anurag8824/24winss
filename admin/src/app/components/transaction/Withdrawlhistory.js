import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
const $ = require("jquery")
$.Datatable = require("datatables.net");
const data=[
    {id:'342',
    Username:'`User1',
    // palyer2:'User2',
    amount:'100',
    // status:'Pending',
    screenshot:"https://media.istockphoto.com/photos/amber-fort-and-maota-lake-jaipur-rajasthan-india-picture-id1135820309?s=612x612",
    // Action:<button className="btn btn-primary">Accept</button>,
    },
    {id:'342',
    Username:'`User1',
    // palyer2:'User2',
    amount:'100',
    screenshot:"https://media.istockphoto.com/photos/amber-fort-and-maota-lake-jaipur-rajasthan-india-picture-id1135820309?s=612x612",

},
    {id:'342',
    Username:'`User4',
    // palyer2:'User2',
    amount:'100',
    screenshot:"https://media.istockphoto.com/photos/amber-fort-and-maota-lake-jaipur-rajasthan-india-picture-id1135820309?s=612x612",

    },
]


const Withdrawlhistory = () => {
  return (
    <div className="row ">
      <div className="col-12 grid-margin">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Withdrawl history</h4>
            <div className="table-responsive">
              <table className="table">
                <thead>
                <tr>
                      <th>#</th>
                      <th> ID</th>
                      <th> Username</th>
                      <th> Amount </th>
                      <th> screenshot </th>
                      <th> Action </th>
                    </tr>
                </thead>
                <tbody>
            {data.map((item,index)=>{
                return(
                  <tr index={item.id}>
                    <td>{index +1}</td>
                    <td>{item.id}</td>
                    <td>{item.Username}</td>
                    <td>{item.amount}</td>
                    <td>
                        <img src={item.screenshot} style={{
                                      borderRadius: '5px',
                                      width: '4rem',
                                      height: '4rem',  
                                    }}
                                    id={`ss${index}`}
                                    onClick={()=>{
                                      // window.open(item.Document)
                                      console.log(item.Document)
                                      const ss = document.getElementById(`ss${index}`)
                                      const width = ss.style.width
                                      const height = ss.style.height
                                      if(width === '4rem'){
                                        ss.style.width = '100%'
                                        ss.style.height = '100%'
                                      }
                                      else{
                                        ss.style.width = '4rem'
                                        ss.style.height = '4rem'
                                      }
                                  }}/>
                    </td>
                    <td>
                    <button className="btn btn-primary mr-2">Accept</button>
                    <button className="btn btn-danger ">Reject</button>
                    </td>
                    {/* <td> */}
                  </tr>
                )})}                   
                  
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdrawlhistory;
