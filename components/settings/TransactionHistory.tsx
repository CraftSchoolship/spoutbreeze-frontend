"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
  Link,
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getTransactions, Transaction } from "@/actions/subscription";

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getStatusChip = (status: string, type: string) => {
    if (type === "refund") {
      return <Chip label="Refunded" size="small" color="info" />;
    }
    switch (status) {
      case "succeeded":
        return <Chip label="Paid" size="small" color="success" />;
      case "failed":
        return <Chip label="Failed" size="small" color="error" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Card sx={{ mt: 4, borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <ReceiptIcon color="action" />
          <Typography variant="h6" fontWeight={700}>
            Payment History
          </Typography>
        </Box>

        {transactions.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
            No transactions yet.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Receipt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{formatDate(txn.created_at)}</TableCell>
                    <TableCell>{txn.description || "Payment"}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: txn.transaction_type === "refund" ? "success.main" : "text.primary",
                          fontWeight: 500,
                        }}
                      >
                        {txn.transaction_type === "refund" ? "+" : ""}
                        {formatAmount(txn.amount, txn.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(txn.status, txn.transaction_type)}
                    </TableCell>
                    <TableCell>
                      {txn.receipt_url ? (
                        <Link
                          href={txn.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                        >
                          <OpenInNewIcon fontSize="small" />
                          View
                        </Link>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
