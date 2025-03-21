'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Avatar
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useApp } from '../context/AppContext';

export default function Navigation() {
    const pathname = usePathname();
    const { user, logout } = useApp();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2, display: { sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography
                    variant="h6"
                    component={Link}
                    href="/"
                    sx={{
                        flexGrow: 1,
                        textDecoration: 'none',
                        color: 'inherit'
                    }}
                >
                    Code Marketplace
                </Typography>
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
                    <Button
                        color="inherit"
                        component={Link}
                        href="/listings"
                        sx={{
                            textDecoration: 'none',
                            borderBottom: pathname === '/listings' ? '2px solid white' : 'none'
                        }}
                    >
                        Browse
                    </Button>
                    {user ? (
                        <>
                            <Button
                                color="inherit"
                                component={Link}
                                href={`/listings/user/${user.address}`}
                                sx={{
                                    textDecoration: 'none',
                                    borderBottom: pathname === `/listings/user/${user.address}` ? '2px solid white' : 'none'
                                }}
                            >
                                My Listings
                            </Button>
                            <Button
                                color="inherit"
                                component={Link}
                                href={`/purchases/user/${user.address}`}
                                sx={{
                                    textDecoration: 'none',
                                    borderBottom: pathname === `/purchases/user/${user.address}` ? '2px solid white' : 'none'
                                }}
                            >
                                My Purchases
                            </Button>
                            <IconButton
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <Avatar sx={{ width: 32, height: 32 }}>
                                    {user.address.slice(0, 2).toUpperCase()}
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Button
                            color="inherit"
                            component={Link}
                            href="/login"
                            sx={{
                                textDecoration: 'none',
                                borderBottom: pathname === '/login' ? '2px solid white' : 'none'
                            }}
                        >
                            Login
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
} 