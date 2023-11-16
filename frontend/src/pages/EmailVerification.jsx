import React, { useState, useEffect } from 'react';
import { verifyEmail } from '../services/authService';
import { useParams } from 'react-router-dom';

const EmailVerificationPage = () => {
  const [verificationStatus, setVerificationStatus] = useState('Verifying...');

  const { token } = useParams();
  console.log(token);
  useEffect(() => {
    const verify = async () => {
      try {
        const response = await verifyEmail(token);
        console.log(response);
        setVerificationStatus(response.message);
      } catch (error) {
        setVerificationStatus(error?.response?.data?.message);
      }
    };

    verify();
  }, [token]);

  return (
    <div>
      <h1>Email Verification</h1>
      <div>{verificationStatus}</div>
    </div>
  );
};

export default EmailVerificationPage;
