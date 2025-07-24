import { prisma } from "../database.js";
import ExcelJS from "exceljs";
import { dialog, SaveDialogOptions } from "electron";
import { Prisma } from "@prisma/client";
import { promises as fs } from "fs"; // Modern filesystem import

interface WorksheetRowData {
  no?: number;
  order_id: string;
  qty: number;
  menu_name: string;
  price: number;
  subtotal: number;
  order_type: string;
  location: string;
  cashier: string;
  status: string;
  order_date: Date;
  notes: string;
}

interface SummaryRowData {
  menu_name: string;
  qty: number | { formula: string };
  subtotal: number | { formula: string };
}

export async function generateExcelReportKitchen(
  type_export: "today" | "weekly" | "monthly" | "annual" | "custom" | string,
  start_date: string,
  end_date: string,
) {
  try {
    const workbook = new ExcelJS.Workbook();

    // Create worksheets for both categories
    const makananWorksheet = workbook.addWorksheet("Makanan");
    const minumanWorksheet = workbook.addWorksheet("Minuman");

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
        console.log(`Original start_date: ${start_date}`);
        console.log(`Original end_date: ${end_date}`);

        // Parse dates and validate
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid date format provided");
        }

        // Adjust end date to cover entire day
        endDate.setHours(23, 59, 59, 999);

        console.log(`Adjusted start date: ${startDate.toISOString()}`);
        console.log(`Adjusted end date: ${endDate.toISOString()}`);

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
        detail_message: "Tidak ada data kitchen untuk periode yang dipilih",
        errorCode: "NO_DATA",
      };
    }

    // Configure columns for both worksheets (same structure)
    const worksheetColumns = [
      { header: "No", key: "no", width: 5 },
      { header: "Order ID", key: "order_id", width: 15 },
      { header: "Qty", key: "qty", width: 10 },
      { header: "Menu Name", key: "menu_name", width: 30 },
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
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD3D3D3" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
    };

    // Initialize counters for both worksheets
    let makananRowNumber = 1;
    let minumanRowNumber = 1;

    // Helper function to add rows with proper styling
    const addRowWithStyle = (
      worksheet: ExcelJS.Worksheet,
      data: WorksheetRowData | SummaryRowData,
      rowNumber: number,
    ) => {
      const row = worksheet.addRow(data);

      // Style the row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
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
      // Determine location information
      const location =
        kitchen.no_meja !== "-"
          ? `Meja ${kitchen.no_meja}`
          : kitchen.no_billiard !== "-"
          ? `Billiard ${kitchen.no_billiard}`
          : "Takeaway";

      // Process OrderCafe items (from MenuCafe)
      kitchen.order.forEach((order) => {
        const rowData = {
          no: 0, // Will be set based on category
          order_id: order.id_order_cafe,
          qty: order.qty,
          menu_name: order.menucafe.name,
          price: order.menucafe.price,
          subtotal: order.subtotal,
          order_type: kitchen.order_type,
          location: location,
          cashier: kitchen.name_cashier,
          status: kitchen.status_kitchen,
          order_date: order.created_at,
          notes: order.keterangan || "-",
        };

        // Directly use the category from MenuCafe
        if (order.menucafe.category_name === "Makanan") {
          makananRowNumber++;
          addRowWithStyle(
            makananWorksheet,
            {
              ...rowData,
              no: makananRowNumber - 1,
            },
            makananRowNumber,
          );
        } else {
          minumanRowNumber++;
          addRowWithStyle(
            minumanWorksheet,
            {
              ...rowData,
              no: minumanRowNumber - 1,
            },
            minumanRowNumber,
          );
        }
      });

      // Process ItemOrder items (custom items)
      // Since ItemOrder doesn't have category, we'll treat them all as "Makanan"
      // or you might want to exclude them if they don't fit either category
      kitchen.item.forEach((item) => {
        const rowData = {
          no: 0,
          order_id: item.id_order_cafe_item,
          qty: item.qty,
          menu_name: item.name_menu,
          price: 0, // ItemOrder doesn't have price in model
          subtotal: 0, // ItemOrder doesn't have subtotal in model
          order_type: kitchen.order_type,
          location: location,
          cashier: kitchen.name_cashier,
          status: kitchen.status_kitchen,
          order_date: item.created_at,
          notes: "-",
        };

        // Default all ItemOrder to Makanan (or you can exclude them)
        makananRowNumber++;
        addRowWithStyle(
          makananWorksheet,
          {
            ...rowData,
            no: makananRowNumber - 1,
          },
          makananRowNumber,
        );
      });
    });

    // Add summary rows with totals
    const addSummary = (
      worksheet: ExcelJS.Worksheet,
      rowNumber: number,
      category: string,
    ) => {
      if (rowNumber > 1) {
        // Add empty row
        worksheet.addRow([]);

        // Add total row
        const totalRow = worksheet.addRow({
          menu_name: `TOTAL ${category.toUpperCase()}`,
          qty: { formula: `SUM(C2:C${rowNumber})` },
          subtotal: { formula: `SUM(E2:E${rowNumber})` }, // Changed to column E (subtotal)
        });

        // Style the total row
        totalRow.eachCell((cell) => {
          cell.font = { bold: true };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF0F0F0" },
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        // Format numeric cells
        totalRow.getCell("subtotal").numFmt = "#,##0";
      }
    };

    addSummary(makananWorksheet, makananRowNumber, "makanan");
    addSummary(minumanWorksheet, minumanRowNumber, "minuman");

    // Apply styles to both worksheets
    styleHeader(makananWorksheet);
    styleHeader(minumanWorksheet);

    // Format date cells in both worksheets
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

    // Show save dialog with proper typing
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

    // Save the file using modern fs promises
    console.log("filePath", filePath);
    await fs.writeFile(filePathData.filePath, bufferData);

    return {
      success: true,
      filePath: filePath,
      message: `Report saved successfully to ${filePath}`,
    };
  } catch (err) {
    console.error("Error generating Excel report:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
