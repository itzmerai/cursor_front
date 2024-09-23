import { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';

interface Company {
  company_id: number;
  company_name: string;
  company_qr: string;
}

function AdminDashboard() {
  const [companyName, setCompanyName] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [studentUsername, setStudentUsername] = useState<string>('');
  const [studentPassword, setStudentPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [randomString, setRandomString] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([]);

  // Function to generate a random string
  const generateRandomString = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  // Generate QR Code with a random string
  const generateQrCode = () => {
    const randomStr = generateRandomString(10);
    setRandomString(randomStr);
    setQrCode(randomStr);
    setMessage('QR Code generated. You can now add the company.');
  };

  // Add company with the pre-generated QR code (random string)
  const addCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!qrCode) {
      setMessage('Please generate a QR code first.');
      return;
    }

    try {
      await axios.post('https://cursor-back.vercel.app/admin/company', { companyName, qrCode });
      setMessage('Company added successfully');
      setQrCode('');
      setRandomString('');
      setCompanyName('');
      fetchCompanies();
    } catch (error) {
      setMessage('Error adding company');
    }
  };

  // Fetch companies from the backend
  const fetchCompanies = async () => {
    try {
      const response = await axios.get('https://cursor-back.vercel.app/admin/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  // Add student without QR code
  const addStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post('https://cursor-back.vercel.app/admin/student', 
        { name: studentName, username: studentUsername, password: studentPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessage('Student added successfully');
      setStudentName('');
      setStudentUsername('');
      setStudentPassword('');
    } catch (error) {
      setMessage('Error adding student');
    }
  };

  // Download QR Code as image
  const downloadQrCode = (qrValue: string, companyName: string) => {
    const canvas = document.getElementById(qrValue) as HTMLCanvasElement | null;
    if (!canvas) {
      setMessage('Canvas not found');
      return;
    }
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${companyName}_qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {message && <p>{message}</p>}

      {/* Add Company Form */}
      <form onSubmit={addCompany}>
        <h3>Add Company</h3>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company Name"
          required
        />
        <button type="button" onClick={generateQrCode}>Generate QR Code</button>
        {qrCode && (
          <div>
            <h4>Generated QR Code (Random String: {randomString}):</h4>
            <QRCodeCanvas id={qrCode} value={qrCode} />
          </div>
        )}
        <button type="submit" disabled={!qrCode}>Add Company</button>
      </form>

      {/* Add Student Form */}
      <form onSubmit={addStudent}>
        <h3>Add Student</h3>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Student Name"
          required
        />
        <input
          type="text"
          value={studentUsername}
          onChange={(e) => setStudentUsername(e.target.value)}
          placeholder="Student Username"
          required
        />
        <input
          type="password"
          value={studentPassword}
          onChange={(e) => setStudentPassword(e.target.value)}
          placeholder="Student Password"
          required
        />
        <button type="submit">Add Student</button>
      </form>

      {/* Display Company Table with QR Codes */}
      <h3>Companies</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>QR Code</th>
            <th>Download QR Code</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.company_id}>
              <td>{company.company_name}</td>
              <td>
                <QRCodeCanvas id={company.company_qr} value={company.company_qr} size={100} />
              </td>
              <td>
                <button onClick={() => downloadQrCode(company.company_qr, company.company_name)}>
                  Download QR Code
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
