import { prisma } from "../database.js";
import ExcelJS from "exceljs";
import { dialog, SaveDialogOptions } from "electron";
import { Prisma } from "@prisma/client";
import { promises as fs } from "fs";

interface WorksheetRowData {
  no: number;
  order_id: string;
  qty: number;
  menu_name: string;
  category: string; // New column
  price: number;
  subtotal: number;
  order_type: string;
  location: string;
  cashier: string;
  status: string;
  order_date: Date;
  notes: string;
}

interface BestSellerItem {
  name: string;
  category: string;
  totalQty: number;
  totalRevenue: number;
}

export async function generateExcelReportKitchen(
  type_export: "today" | "weekly" | "monthly" | "annual" | "custom" | string,
  start_date: string,
  end_date: string,
) {
  try {
    const workbook = new ExcelJS.Workbook();

    // Create worksheets
    const makananWorksheet = workbook.addWorksheet("Makanan");
    const minumanWorksheet = workbook.addWorksheet("Minuman");
    const bestSellerWorksheet = workbook.addWorksheet("Best Seller");

    // Set date filter
    let dateFilter: Prisma.KitchenDataWhereInput = {};
    const now = new Date();

    switch (type_export) {
      case "today":
        dateFilter = {
          created_at: {
            gte: new Date(now.setHours(0, 0, 0, 0)),
            lte: new Date(now.setHours(23, 59, 59, 999)),
          },
        };
        break;

      case "weekly": {
        const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
        const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        dateFilter = {
          created_at: {
            gte: new Date(firstDay.setHours(0, 0, 0, 0)),
            lte: new Date(lastDay.setHours(23, 59, 59, 999)),
          },
        };
        break;
      }

      case "monthly":
        dateFilter = {
          created_at: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lte: new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0,
              23,
              59,
              59,
              999,
            ),
          },
        };
        break;

      case "annual":
        dateFilter = {
          created_at: {
            gte: new Date(now.getFullYear(), 0, 1),
            lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
          },
        };
        break;

      case "custom": {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (isNaN(startDate.getTime())) throw new Error("Invalid start date");
        if (isNaN(endDate.getTime())) throw new Error("Invalid end date");

        endDate.setHours(23, 59, 59, 999);
        dateFilter = {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        };
        break;
      }

      default:
        dateFilter = {};
    }

    // Fetch data including all necessary relations
    const kitchenData = await prisma.kitchenData.findMany({
      where: { ...dateFilter, status_kitchen: "DONE" },
      include: {
        item: true,
        order: {
          include: {
            menucafe: true,
          },
        },
      },
      orderBy: {
        created_at: "asc",
      },
    });

    if (kitchenData.length === 0) {
      return {
        success: false,
        detail_message: "No kitchen data for selected period",
        errorCode: "NO_DATA",
      };
    }

    // Configure columns for worksheets
    const worksheetColumns = [
      { header: "No", key: "no", width: 5 },
      { header: "Order ID", key: "order_id", width: 15 },
      { header: "Qty", key: "qty", width: 10 },
      { header: "Menu Name", key: "menu_name", width: 30 },
      { header: "Category", key: "category", width: 15 }, // New column
      { header: "Price", key: "price", width: 15 },
      { header: "Subtotal", key: "subtotal", width: 15 },
      { header: "Order Type", key: "order_type", width: 15 },
      { header: "Table/Billiard", key: "location", width: 20 },
      { header: "Cashier", key: "cashier", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Order Date", key: "order_date", width: 20 },
      { header: "Notes", key: "notes", width: 30 },
    ];

    makananWorksheet.columns = worksheetColumns;
    minumanWorksheet.columns = worksheetColumns;

    // Style function for header row
    const styleHeader = (worksheet: ExcelJS.Worksheet) => {
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4F81BD" },
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
    };

    // Initialize counters
    let makananRowNumber = 1;
    let minumanRowNumber = 1;
    const salesMap = new Map<string, BestSellerItem>();

    // Helper function to add rows with proper styling
    const addRowWithStyle = (
      worksheet: ExcelJS.Worksheet,
      data: WorksheetRowData,
      rowNumber: number,
    ) => {
      const row = worksheet.addRow(data);

      // Style the row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFD3D3D3" } },
          left: { style: "thin", color: { argb: "FFD3D3D3" } },
          bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
          right: { style: "thin", color: { argb: "FFD3D3D3" } },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });

      // Format numeric cells
      if (rowNumber > 1) {
        row.getCell("price").numFmt = "#,##0";
        row.getCell("subtotal").numFmt = "#,##0";
        row.getCell("qty").alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      }

      return row;
    };

    // Process each kitchen order
    kitchenData.forEach((kitchen) => {
      const location =
        kitchen.no_meja !== "-"
          ? `Meja ${kitchen.no_meja}`
          : kitchen.no_billiard !== "-"
          ? `Billiard ${kitchen.no_billiard}`
          : "Takeaway";

      // Process OrderCafe items
      kitchen.order.forEach((order) => {
        const rowData = {
          no: 0,
          order_id: order.id_order_cafe,
          qty: order.qty,
          menu_name: order.menucafe.name,
          category: order.menucafe.category_name, // New column data
          price: order.menucafe.price,
          subtotal: order.subtotal,
          order_type: kitchen.order_type,
          location: location,
          cashier: kitchen.name_cashier,
          status: kitchen.status_kitchen,
          order_date: order.created_at,
          notes: order.keterangan || "-",
        };

        // Track sales for best sellers
        const key = `${order.menucafe.name}|${order.menucafe.category_name}`;
        const existing = salesMap.get(key);

        if (existing) {
          existing.totalQty += order.qty;
          existing.totalRevenue += order.subtotal;
        } else {
          salesMap.set(key, {
            name: order.menucafe.name,
            category: order.menucafe.category_name,
            totalQty: order.qty,
            totalRevenue: order.subtotal,
          });
        }

        // Add to appropriate worksheet
        if (order.menucafe.category_name === "Makanan") {
          makananRowNumber++;
          addRowWithStyle(
            makananWorksheet,
            { ...rowData, no: makananRowNumber - 1 },
            makananRowNumber,
          );
        } else {
          minumanRowNumber++;
          addRowWithStyle(
            minumanWorksheet,
            { ...rowData, no: minumanRowNumber - 1 },
            minumanRowNumber,
          );
        }
      });

      // Process ItemOrder items (custom items)
      kitchen.item.forEach((item) => {
        makananRowNumber++;
        addRowWithStyle(
          makananWorksheet,
          {
            no: makananRowNumber - 1,
            order_id: item.id_order_cafe_item,
            qty: item.qty,
            menu_name: item.name_menu,
            category: "Makanan", // Default category for custom items
            price: 0,
            subtotal: 0,
            order_type: kitchen.order_type,
            location: location,
            cashier: kitchen.name_cashier,
            status: kitchen.status_kitchen,
            order_date: item.created_at,
            notes: "-",
          },
          makananRowNumber,
        );
      });
    });

    // ===== Best Seller Worksheet =====
    bestSellerWorksheet.columns = [
      { header: "Rank", key: "rank", width: 8 },
      { header: "Menu Name", key: "name", width: 30 },
      { header: "Category", key: "category", width: 15 },
      { header: "Total Sold", key: "totalQty", width: 12 },
      { header: "Total Revenue", key: "totalRevenue", width: 15 },
      { header: "Avg Price", key: "avgPrice", width: 15 },
    ];

    // Sort and get top 20 best sellers
    const bestSellers = Array.from(salesMap.values())
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 20);

    // Add data to best seller worksheet
    bestSellers.forEach((item, index) => {
      bestSellerWorksheet.addRow({
        rank: index + 1,
        name: item.name,
        category: item.category,
        totalQty: item.totalQty,
        totalRevenue: item.totalRevenue,
        avgPrice: item.totalRevenue / item.totalQty,
      });
    });

    // Style best seller worksheet
    styleHeader(bestSellerWorksheet);

    // Format numeric cells in best seller worksheet
    bestSellerWorksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.getCell("totalQty").numFmt = "#,##0";
        row.getCell("totalRevenue").numFmt = '"Rp"#,##0.00';
        row.getCell("avgPrice").numFmt = '"Rp"#,##0.00"';
      }
    });

    // Add summary sections to food and drink worksheets
    const addSummary = (
      worksheet: ExcelJS.Worksheet,
      rowNumber: number,
      title: string,
    ) => {
      if (rowNumber > 1) {
        worksheet.addRow([]); // Empty row

        const summaryRow = worksheet.addRow({
          menu_name: `TOTAL ${title}`,
          category: "", // Empty for summary row
          qty: { formula: `SUM(C2:C${rowNumber})` },
          subtotal: { formula: `SUM(G2:G${rowNumber})` }, // Changed from F to G
        });

        summaryRow.eachCell((cell) => {
          cell.font = { bold: true };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF2F2F2" },
          };
          cell.border = {
            top: { style: "thin", color: { argb: "FF000000" } },
            left: { style: "thin", color: { argb: "FF000000" } },
            bottom: { style: "thin", color: { argb: "FF000000" } },
            right: { style: "thin", color: { argb: "FF000000" } },
          };
        });

        summaryRow.getCell("subtotal").numFmt = '"Rp"#,##0.00';
      }
    };

    addSummary(makananWorksheet, makananRowNumber, "MAKANAN");
    addSummary(minumanWorksheet, minumanRowNumber, "MINUMAN");

    // Apply styles to all worksheets
    styleHeader(makananWorksheet);
    styleHeader(minumanWorksheet);

    // Format date cells
    [makananWorksheet, minumanWorksheet].forEach((ws) => {
      ws.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const dateCell = row.getCell("order_date");
          dateCell.numFmt = "dd/mm/yyyy hh:mm:ss";
        }
      });
    });

    const excelBuffer = await workbook.xlsx.writeBuffer();
    const bufferData = Buffer.from(excelBuffer);

    // Generate filename
    let defaultFilename = `Laporan Kitchen`;
    if (type_export === "custom") {
      defaultFilename += ` ${start_date} - ${end_date}`;
    } else {
      defaultFilename += ` ${type_export} ${new Date()
        .toISOString()
        .slice(0, 10)}`;
    }
    defaultFilename += ".xlsx";

    // Show save dialog
    const saveOptions: SaveDialogOptions = {
      title: "Save Excel Report",
      defaultPath: defaultFilename,
      filters: [
        { name: "Excel Files", extensions: ["xlsx"] },
        { name: "All Files", extensions: ["*"] },
      ],
    };

    const filePath = await dialog.showSaveDialog(saveOptions);
    const filePathData: {
      canceled: boolean;
      filePath: string;
    } = filePath as unknown as {
      canceled: boolean;
      filePath: string;
    };
    if (!filePath) {
      return { success: false, error: "Save dialog canceled" };
    }

    await fs.writeFile(filePathData.filePath, bufferData);

    return {
      success: true,
      filePath: filePath,
      message: `Report saved successfully to ${filePath}`,
    };
  } catch (err) {
    console.error("Error generating report:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}