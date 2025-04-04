import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const transactionId = location.state?.transactionId;

  const generatePDFReport = async () => {
    try {
      
      const receiptData = {
        transactionId: transactionId || "TXN-1742986683892-f12d4r8uo",
        date: "March 26, 2025",
        customerDetails: {
          name: "wert",
          email: "wert@gmail.com",
          phone: "0765544333",
          address: "Matale"
        },
        paymentDetails: {
          purpose: "Advertisement",
          amount: "LKR 1235.00",
          status: "Completed"
        },
        generatedAt: "March 26, 2025, 10:59 AM"
      };

      // Initialize jsPDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(40, 53, 147);
      doc.text('PAYMENT RECEIPT', 105, 20, { align: 'center' });
      
      // Add transaction details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Transaction ID: ${receiptData.transactionId}`, 20, 35);
      doc.text(`Date: ${receiptData.date}`, 20, 45);
      
      // Add line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 50, 190, 50);
      
      // Customer details section
      doc.setFont('helvetica', 'bold');
      doc.text('Customer Details:', 20, 60);
      doc.setFont('helvetica', 'normal');
      
      doc.text(`Name: ${receiptData.customerDetails.name}`, 20, 70);
      doc.text(`Email: ${receiptData.customerDetails.email}`, 20, 80);
      doc.text(`Phone: ${receiptData.customerDetails.phone}`, 20, 90);
      doc.text(`Address: ${receiptData.customerDetails.address}`, 20, 100);
      
      // Add line separator
      doc.line(20, 105, 190, 105);
      
      // Payment details section
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Details:', 20, 115);
      doc.setFont('helvetica', 'normal');
      
      doc.text(`Purpose: ${receiptData.paymentDetails.purpose}`, 20, 125);
      doc.text(`Amount Paid: ${receiptData.paymentDetails.amount}`, 20, 135);
      doc.text(`Status: ${receiptData.paymentDetails.status}`, 20, 145);
      
      // Add footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated At: ${receiptData.generatedAt}`, 20, 160);
      doc.text('Thank you for your payment! If you have any questions, please contact us.', 
        105, doc.internal.pageSize.height - 20, { align: 'center' });
      
      // Save the PDF
      doc.save(`payment-receipt-${receiptData.transactionId}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating payment receipt. Please try again later.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow" style={{ width: '100%', maxWidth: '600px' }}>
        <div className="card-body text-center p-4">
          <h2 className="card-title text-success mb-3">Payment Successful!</h2>
          <p className="mb-4">Transaction ID: {transactionId}</p>
          
          <div className="d-flex justify-content-center gap-3">
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/')}
            >
              Return to Homepage
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={generatePDFReport}
            >
              Download Payment Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;