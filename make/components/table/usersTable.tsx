"use client";

import React from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { AlertDialog, Button, Flex } from "@radix-ui/themes";
import type { AppDispatch, RootState } from "@/state/store";
import { Trash2 } from "lucide-react";
import { deleteUserAsync, type User } from "@/state/API/ApiSlice";

import DialogForUserEdit from "@/components/dialogs/dialogForUserEdit";

type UserRow = {
  id: string;
  name: string;
  email: string;
  companyName: string;
  Position?: string;
  createdAt?: string;
  company: {
    id: string;
    name: string;
  };
};

type UserWithOptionalLowercasePosition = {
  Position?: string;
  position?: string;
};

const DeleteUserButton = ({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteUserAsync(userId)).unwrap();
      setOpen(false);
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger className="inline-flex h-6 w-6 items-center justify-center rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400">
        <Trash2 size={8} />
      </AlertDialog.Trigger>

      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>Delete User</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure you want to delete <strong>{userName}</strong>? This
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

const columns: GridColDef<UserRow>[] = [
  { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
  { field: "email", headerName: "Email", flex: 1, minWidth: 220 },
  { field: "companyName", headerName: "Company", flex: 1, minWidth: 180 },
  {
    field: "Position",
    headerName: "Position",
    flex: 1,
    minWidth: 160,
    valueGetter: (value) => value || "N/A",
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
    minWidth: 140,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      const editableUser: User = {
        id: params.row.id,
        name: params.row.name,
        email: params.row.email,
        companyId: params.row.company?.id || "",
        Position: params.row.Position || "",
      };

      return (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <DialogForUserEdit userInfo={editableUser} />

          <Tooltip title="Delete">
            <span>
              <DeleteUserButton
                userId={params.row.id}
                userName={params.row.name}
              />
            </span>
          </Tooltip>
        </Box>
      );
    },
  },
];

const UsersTable = () => {
  const allUsers = useSelector((state: RootState) => state.api.allUsers);

  const rows: UserRow[] = (allUsers || []).map((user) => ({
    ...user,
    Position:
      (user as UserWithOptionalLowercasePosition).Position ||
      (user as UserWithOptionalLowercasePosition).position ||
      "",
    companyName: user.company?.name || "N/A",
  }));

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        All Users{" "}
        <span className="text-blue-700 text-lg">
          Total Users: {allUsers?.length}
        </span>
      </Typography>

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

export default UsersTable;
