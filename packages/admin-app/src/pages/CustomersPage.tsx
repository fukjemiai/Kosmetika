import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { customersApi } from '../api/client';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      customersApi
        .list(search || undefined)
        .then(setCustomers)
        .catch(() => setCustomers([]));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Zakaznice
      </Typography>

      <TextField
        placeholder="Hledat podle jmena, emailu, telefonu..."
        fullWidth
        size="small"
        sx={{ mb: 3, maxWidth: 500 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Jmeno</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>Registrovana</TableCell>
              <TableCell>Poznamky</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  {c.firstName} {c.lastName}
                </TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>{c.keycloakId ? 'Ano' : 'Ne'}</TableCell>
                <TableCell>{c.notes || '-'}</TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Zadne zakaznice
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default CustomersPage;
