import React, { useState } from "react";
import { Table, Avatar, ConfigProvider } from "antd";
import { useGetRecentProductQuery } from "../../../redux/apiSlices/overViewSlice";

function RecentSellingProduct() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useGetRecentProductQuery(page);

  // Ensure data is available
  const earnings = data?.data?.earnings || [];

  // Format data for the table
  const dataSource = earnings.map((item, index) => ({
    key: item._id,
    serial: `#${index + 1}`,
    productName: item.productName || "N/A",
    email: item.email,
    createdAt: new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(item.createdAt)),
    totalPrice: `$${parseFloat(item.totalPrice).toFixed(2)}`,
  }));

  const columns = [
    {
      title: "SL#",
      dataIndex: "serial",
      key: "serial",
    },
    // {
    //   title: "Product Name",
    //   dataIndex: "productName",
    //   key: "productName",
    //   render: (text) => (
    //     <div className="flex items-center gap-2">
    //       <Avatar shape="square" size="default" src={productImg} />
    //       <span>{text}</span>
    //     </div>
    //   ),
    // },
    {
      title: "User Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Amount",
      dataIndex: "totalPrice",
      key: "totalPrice",
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: () => (
    //     <a href="#" className="hover:text-[#a11d26]">
    //       <IoEye size={24} />
    //     </a>
    //   ),
    // },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "#575858",
            headerSplitColor: "none",
            headerColor: "white",
            borderColor: "#A3A3A3",
            colorBgContainer: "#3a3a3a",
            rowHoverBg: "#4a4a4a",
            colorText: "white",
          },
        },
      }}
    >
      <Table
        dataSource={dataSource}
        columns={columns}
        loading={isLoading}
        size="middle"
        pagination={{
          onChange: (page) => setPage(page),
          pageSize: data?.data?.meta?.limit,
          total: data?.data?.meta?.total,
        }}
      />
    </ConfigProvider>
  );
}

export default RecentSellingProduct;
