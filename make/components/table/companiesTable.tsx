"use client";

import React from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { AlertDialog, Button, Flex } from "@radix-ui/themes";
import { Trash2 } from "lucide-react";
import { deleteCompanyAsync, type Company } from "@/state/API/ApiSlice";
import type { AppDispatch, RootState } from "@/state/store";
import DialogForCompany from "@/components/dialogs/dialogForCompany";
import DialogForCompanyEdit from "@/components/dialogs/dialogForCompanyEdit";

type CompanyRow = {
  id: string;
  name: string;
  email: string;
  tg_bot_token: string;
  tg_chat_id: number;
  createdAt?: string;
};

type CompanyWithOptionalAliases = Company & {
  tgBotToken?: string;
  tgChatId?: number | string;
};

const DeleteCompanyButton = ({
  companyId,
  companyName,
}: {
  companyId: string;
  companyName: string;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteCompanyAsync(companyId)).unwrap();
      setOpen(false);
    } catch (error) {
      console.error("Failed to delete company:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400">
        <Trash2 size={16} />
      </AlertDialog.Trigger>

      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>Delete Company</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure you want to delete <strong>{companyName}</strong>? This
          action cannot be undone.
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray" disabled={isDeleting}>
              Cancel
            </Button>
          </AlertDialog.Cancel>

          <Button color="red" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};

const columns: GridColDef<CompanyRow>[] = [
  { field: "id", headerName: "ID", flex: 1, minWidth: 250 },
  { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
  { field: "email", headerName: "Email", flex: 1, minWidth: 220 },
  {
    field: "tg_bot_token",
    headerName: "TG Bot Token",
    flex: 1,
    minWidth: 240,
  },
  {
    field: "tg_chat_id",
    headerName: "TG Chat ID",
    flex: 1,
    minWidth: 160,
  },
  {
    field: "createdAt",
    headerName: "Registration Date",
    flex: 1,
    minWidth: 180,
    valueGetter: (value) => {
      if (!value) return "N/A";
      return new Date(value).toLocaleDateString();
    },
  },
  {
    field: "actions",
    headerName: "Actions",
    minWidth: 150,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      const editableCompany: Company = {
        id: params.row.id,
        name: params.row.name,
        email: params.row.email,
        tg_bot_token: params.row.tg_bot_token,
        tg_chat_id: params.row.tg_chat_id,
        createdAt: params.row.createdAt || "",
      };

      return (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <DialogForCompanyEdit companyInfo={editableCompany} />

          <Tooltip title="Delete">
            <span>
              <DeleteCompanyButton
                companyId={params.row.id}
                companyName={params.row.name}
              />
            </span>
          </Tooltip>
        </Box>
      );
    },
  },
];

const CompaniesTable = () => {
  const companies = useSelector((state: RootState) => state.api.companies);

  const rows: CompanyRow[] = (companies || []).map((company) => ({
    ...company,
    tg_bot_token:
      (company as CompanyWithOptionalAliases).tg_bot_token ||
      (company as CompanyWithOptionalAliases).tgBotToken ||
      "",
    tg_chat_id: Number(
      (company as CompanyWithOptionalAliases).tg_chat_id ??
        (company as CompanyWithOptionalAliases).tgChatId ??
        0,
    ),
  }));

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          All Companies{" "}
          <span className="text-blue-700 text-lg">
            Total Companies: {companies?.length}
          </span>
        </Typography>

        <DialogForCompany />
      </Box>

      <Box sx={{ height: 620, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 300 },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default CompaniesTable;
