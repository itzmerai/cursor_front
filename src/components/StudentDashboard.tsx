import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QrScanner from 'react-qr-scanner';

function StudentDashboard() {
  const [message, setMessage] = useState('Scanning QR Code...');
  const [isDetecting, setIsDetecting] = useState(false);
  const studentId = '123'; // Assume you have the student ID available

  useEffect(() => {
    setMessage('Scanning QR Code...');
  }, []);

  const handleScan = (data) => {
    if (data) {
      // Check if the data has a "text" property which contains the actual QR code
      const qrText = data.text || data; // Depending on the format returned, either use "text" or data directly

      // Set detection to true when QR code is detected
      setIsDetecting(true);

      try {
        // Process the QR code text and submit it to the backend
        handleSubmit(qrText);
      } catch (error) {
        console.error('Invalid QR Code', error);
        setMessage('Invalid QR Code');
      }
    } else {
      setIsDetecting(false);
    }
  };

  const handleError = (err) => {
    console.error('QR code scan error:', err);
    setMessage('Error scanning QR Code');
  };

  const handleSubmit = async (scannedQr) => {
    const scanTime = new Date().toISOString();

    try {
      const response = await axios.post('http://localhost:5000/student/scan', {
        studentId,
        companyQr: scannedQr, // Submit the QR code text only
        scanTime,
      });

      // If the scan is successful, display the success message
      setMessage(response.data.message || 'Time in done!');
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      setMessage('Error submitting timesheet');
    }
  };

  return (
    <div>
      <h2>Student Dashboard</h2>
      {message && <p>{message}</p>}

      {/* QR Scanner */}
      <div style={styles.scannerContainer}>
        <QrScanner
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={styles.scanner}
        />
      </div>
    </div>
  );
}

const styles = {
  scannerContainer: {
    position: 'relative' as const,
    width: '300px',
    height: '300px',
    margin: '0 auto',
  },
  scanner: {
    width: '100%',
    height: '100%',
  },
};

export default StudentDashboard;
