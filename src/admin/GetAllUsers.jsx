
import { useEffect, useState } from "react";
import Styles from "./_admin.module.css";
import { FaRegEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import {
    fetchAllUsers,
    deleteUser as deleteUserApi,
} from "../api/auth";

const GetAllUsers = () => {
    const [state, setState] = useState(null);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const usersPerPage = 5;

    // Fetch all users using the existing auth.js API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchAllUsers();

                console.log("All users response:", response);

                const userData = Array.isArray(response)
                    ? response
                    : Array.isArray(response?.users)
                    ? response.users
                    : Array.isArray(response?.data)
                    ? response.data
                    : [];

                setState(userData);
            } catch (error) {
                console.error(
                    "Error fetching users:",
                    error.response?.data || error.message
                );

                toast.error("Failed to fetch users");
                setState([]);
            }
        };

        fetchData();
    }, []);

    // Delete user
    const handleDelete = async (id) => {
        const userConfirmed = window.confirm(
            "Do you want to delete this user?"
        );

        if (!userConfirmed) return;

        try {
            await deleteUserApi(id);

            setState((prevUsers) =>
                prevUsers.filter(
                    (user) => (user._id || user.id) !== id
                )
            );

            toast.success("User deleted successfully");
        } catch (error) {
            console.error(
                "Error deleting user:",
                error.response?.data || error.message
            );

            toast.error("Failed to delete user");
        }
    };

    // Search and role filter
    const filteredUsers = (state || []).filter((user) => {
        const searchText = search.toLowerCase();

        const userId = String(user._id || user.id || "");

        const matchesSearch =
            user.name?.toLowerCase().includes(searchText) ||
            user.email?.toLowerCase().includes(searchText) ||
            userId.toLowerCase().includes(searchText);

        const matchesRole =
            roleFilter === "all" ||
            user.role?.toLowerCase() === roleFilter;

        return matchesSearch && matchesRole;
    });

    // Pagination
    const totalPages = Math.ceil(
        filteredUsers.length / usersPerPage
    );

    useEffect(() => {
        setCurrentPage((page) =>
            Math.min(page, Math.max(1, totalPages))
        );
    }, [totalPages]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, roleFilter]);

    const startIndex = (currentPage - 1) * usersPerPage;

    const paginatedUsers = filteredUsers.slice(
        startIndex,
        startIndex + usersPerPage
    );

    const handlePrevious = () => {
        setCurrentPage((page) => Math.max(1, page - 1));
    };

    const handleNext = () => {
        setCurrentPage((page) =>
            Math.min(totalPages, page + 1)
        );
    };

    if (state === null) {
        return <p>Loading users...</p>;
    }

    return (
        <section id={Styles.userList}>
            <article>
                <h1>List of Users</h1>

                {/* Search and Role Filter */}
                <div className={Styles.userFilters}>
                    <input
                        type="text"
                        placeholder="Search by name, email or ID..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                    <select
                        value={roleFilter}
                        onChange={(e) =>
                            setRoleFilter(e.target.value)
                        }
                    >
                        <option value="all">All Roles</option>
                        <option value="user">Users</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>

                <p>Total users found: {filteredUsers.length}</p>

                {/* Users Table */}
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedUsers.length > 0 ? (
                            paginatedUsers.map((user) => {
                                const userId = user._id || user.id;

                                return (
                                    <tr key={userId}>
                                        <td>{userId}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>

                                        <td>
                                            <span
                                                className={Styles.roleBadge}
                                            >
                                                {user.role}
                                            </span>
                                        </td>

                                        <td>
                                            <Link
                                                to={`user/${userId}`}
                                                className={Styles.editButton}
                                                aria-label={`Edit ${user.name}`}
                                                title="Edit user"
                                            >
                                                <FaRegEdit />
                                            </Link>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className={Styles.deleteButton}
                                                onClick={() =>
                                                    handleDelete(userId)
                                                }
                                                aria-label={`Delete ${user.name}`}
                                                title="Delete user"
                                            >
                                                <MdDelete />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {filteredUsers.length > 0 && (
                    <div className={Styles.pagination}>
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>

                        <span>
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            onClick={handleNext}
                            disabled={
                                currentPage === totalPages
                            }
                        >
                            Next
                        </button>
                    </div>
                )}
            </article>
        </section>
    );
};

export default GetAllUsers;
