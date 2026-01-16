import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    CircularProgress,
    Typography,
} from "@mui/material";

import { Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";


const BASE_URL =   "https://prod.panditjee.com";

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const navigate = useNavigate();


    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/clients`);
            const data = await res.json();
            setClients(data);
        } catch (err) {
            console.error("Failed to fetch clients", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (_, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <CircularProgress />
            </div>
        );
    }

    return (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <div className="flex items-center justify-between px-4 py-3">
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Clients
                </Typography>

                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate("/add-client")}
                    >
                        Add Client
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<LinkIcon />}
                        onClick={() => navigate("/connect-platform")}
                    >
                        Connect
                    </Button>
                </Stack>
            </div>


            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>Name</b></TableCell>
                            <TableCell><b>Email</b></TableCell>
                            <TableCell><b>Created At</b></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {clients
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((client) => (
                                <TableRow key={client.id} hover>
                                    <TableCell>{client.name}</TableCell>
                                    <TableCell>{client.email || "-"}</TableCell>
                                    <TableCell>
                                        {client.joined_on
                                            ? new Date(client.joined_on).toLocaleString()
                                            : "-"}
                                    </TableCell>
                                </TableRow>
                            ))}

                        {clients.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    No clients found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={clients.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </Paper>
    );
}
