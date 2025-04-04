import * as React from 'react';
import { useEffect, useState } from "react";
import Header from "./Header";
import InventoryTable from "./InventoryTable";
import { Button } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import ProductModal from "./ProductModal";

const MainPage = () => {
    const [rows, setRows] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editProductId, setEditProductId] = React.useState(null);

    useEffect(() => {
        async function fetchData() {
            handleFetchData();
        }
        fetchData();
    }, []);

    const handleFetchData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/products');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const dataWithUniqueIds = data.map((item, index) => ({ ...item, id: item._id }));
            setRows(dataWithUniqueIds);
        } catch (error) {
            console.error('Error fetching products:', error.message);
        }
    };

    const handleOpenModal = () => {
        setOpenModal(true);
    }
    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
                <Header />
                <InventoryTable rows={rows} setEditProductId={setEditProductId}/>
            </div>
            <Button onClick={handleOpenModal} variant="contained" style={{ borderRadius: '50%', width: '56px', height: '56px', position: 'fixed', bottom: '20px', left: '100px' }}>
                <AddIcon />
            </Button>
            <ProductModal open={openModal} setOpen={setOpenModal} editProductId={editProductId} />
        </>

    );
}

export default MainPage;