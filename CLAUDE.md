# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Status

This repository contains an Autopass Demo project - a prototype for vendor management system.

### Project Structure

- `autopass-demo/` - React + TypeScript + Mantine UI prototype project

### Commands

- Build commands: `cd autopass-demo && npm run build`
- Development server: `cd autopass-demo && npm run dev`
- Linting commands: `cd autopass-demo && npm run lint`

## Architecture

### Autopass Demo
- **Framework**: React + TypeScript + Vite
- **UI Library**: Mantine UI
- **Structure**: 
  - `/src/components/Navigation.tsx` - Side navigation component
  - `/src/components/VendorManagement.tsx` - Main vendor management page
  - `/src/App.tsx` - Main app layout with AppShell

### Features Implemented

#### ✅ 第一階段完成 - 業者管理頁面
- **業者管理界面** - 完整的CRUD界面設計
- **側邊導航選單** - 包含Logo和四個主要功能選項
- **搜尋功能** - 業者名稱搜尋框（UI完成）
- **資料表格** - 顯示業者名稱、合約類型、操作按鈕
- **分頁控制** - 完整分頁功能含active狀態
- **響應式布局** - 支援2160px寬螢幕和各種尺寸

#### 🚧 待完成頁面
- 任務管理頁面
- 圖資管理頁面  
- 商店管理頁面

### 如何繼續開發
1. 啟動開發服務器：`cd autopass-demo && npm run dev`
2. 在瀏覽器打開：http://localhost:5173 或 http://localhost:5174
3. 修改代碼後會自動更新頁面