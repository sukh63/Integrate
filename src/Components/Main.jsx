import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const Main = () => {
  const gridRef = useRef();
  const [columnApi, setColumnApi] = useState(null);
  const [rowData, setRowData] = useState([]);
  const [gasUsedChartData, setGasUsedChartData] = useState([]);
  const hiddenColumnsRef = useRef([]);
  const popupParent = useMemo(() => {
    return document.body;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://api.etherscan.io/api?module=account&action=txlist&startblock=16689267&endblock=18982605&sort=asc&apikey=7I7P1UW9APHJWUDP18X1BX2DJHED7M6ZGM&address=0x6Fb447Ae94F5180254D436A693907a1f57696900'
        );
        setRowData(response.data.result);

        const gasUsedData = response.data.result.map((entry) => ({
          blockNumber: entry.blockNumber,
          gasUsed: entry.gasUsed,
        }));

        setGasUsedChartData(gasUsedData);
      } catch (error) {
        console.error('Error fetching transactions:', error.message);
      }
    };

    fetchData();
  }, []);

  const onGridReady = (params) => {
    //gridRef.current = params.api;
    setColumnApi(params.columnApi);
  };

  const onBtnExport = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.exportDataAsCsv();
    } else {
      console.warn('Grid or Grid API is not available.');
    }
  }, []);

  const onBtExportexcel = useCallback(() => {
    if (gridRef.current.api && gridRef.current.api.getModel().rowsToDisplay.length > 0) {
      gridRef.current.api.exportDataAsExcel();
    } else {
      console.warn('No data available for export.');
    }
  }, []);

  const onColumnVisibilityChange = (column, isVisible) => {
    if (columnApi) {
      columnApi.setColumnVisible(column, isVisible);
      
      // Update hidden columns list
      hiddenColumnsRef.current = isVisible
        ? hiddenColumnsRef.current.filter((col) => col !== column)
        : [...hiddenColumnsRef.current, column];
    }
  };

  const columnDefs = [
    { headerName: 'Block Number', field: 'blockNumber', tooltipField: 'hash', filter: 'agNumberColumnFilter' },
    { headerName: 'Hash', field: 'hash', filter: 'agTextColumnFilter' },
    { headerName: 'To', field: 'to', filter: 'agTextColumnFilter' },
    { headerName: 'Value', field: 'value', filter: 'agNumberColumnFilter' },
    { headerName: 'Gas', field: 'gas', filter: 'agNumberColumnFilter' },
    { headerName: 'Gas Price', field: 'gasPrice', filter: 'agNumberColumnFilter' },
    { headerName: 'Gas Used', field: 'gasUsed', filter: 'agNumberColumnFilter' },
    {
      headerName: 'Function Name',
      field: 'functionName',
      filter: 'agTextColumnFilter',
      resizable: true,
      minWidth: 200,
      width: 250,
    },
  ];

  return (
    <>
      <div style={{ maxWidth: '100%', width: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ margin: '10px 0' }}>
            <button onClick={onBtExportexcel}>Download Excel export file</button>
            <button onClick={onBtnExport}>Download CSV export file</button>
          </div>
          <div style={{ marginBottom: '15px' }}>
            {columnDefs.map((column) => (
              <label key={column.field}>
                <input
                  type="checkbox"
                  checked={column.visible}
                  onChange={(e) => onColumnVisibilityChange(column.field, e.target.checked)}
                />
                {column.headerName}
              </label>
            ))}
          </div>
        </div>
        <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
          <AgGridReact
            columnDefs={columnDefs}
            rowData={rowData}
            domLayout="autoHeight"
            enableSorting={true}
            enableFilter={true}
            suppressDragLeaveHidesColumns={true}
            rowDragManaged={true}
            enableExcelExport={true}
            popupParent={popupParent}
            enableCsvExport={true}
            tooltipShowDelay={0}
            ref={gridRef}
            onGridReady={onGridReady}
          />
        </div>
      </div>
    </>
  );
};

export default Main;
