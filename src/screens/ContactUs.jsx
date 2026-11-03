import React, { useState,useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";


const ContactUs=()=>{
const Navigate=useNavigate();
const [formdata,setFormdata]=useState({
    name:'',
    email:"",
    subject:"",
    massage:"",
});

const [isSubmitting,setIsSubmitting]=useState(false);
const [submitStatus,setSubmitstatus]=useState(null);



    return(
        <>
        </>
    )
}

export default ContactUs;