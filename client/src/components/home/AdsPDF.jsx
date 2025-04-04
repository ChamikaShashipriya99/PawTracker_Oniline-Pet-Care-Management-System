import React from "react";
import PropTypes from "prop-types";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Define styles for a professional and well-structured layout
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#f8f9fa",
    padding: 40,
  },
  header: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2c3e50",
  },
  section: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 5,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#34495e",
  },
  text: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 12,
    color: "#95a5a6",
  },
});

const AdsPDF = ({ book }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <Text style={styles.header}> Advertisement Details</Text>
      
      {/* Ticket Information */}
      <View style={styles.section}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.text}>{book.name}</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.text}>{book.email}</Text>
        <Text style={styles.label}>Grade:</Text>
        <Text style={styles.text}>{book.grade}</Text>
        <Text style={styles.label}>Contact Number:</Text>
        <Text style={styles.text}>{book.contactNumber}</Text>
        <Text style={styles.label}>Category:</Text>
        <Text style={styles.text}>{book.category}</Text>
        <Text style={styles.label}>Subject:</Text>
        <Text style={styles.text}>{book.subject}</Text>
        <Text style={styles.label}>Message:</Text>
        <Text style={styles.text}>{book.message}</Text>
      </View>
      
      {/* Footer */}
      <Text style={styles.footer}>Thank you for your booking. We look forward to seeing you!</Text>
    </Page>
  </Document>
);

AdsPDF.propTypes = {
  book: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    grade: PropTypes.string,
    contactNumber: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    subject: PropTypes.string.isRequired,
    message: PropTypes.string,
  }).isRequired,
};

export default AdsPDF;
