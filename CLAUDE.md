# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Status

This repository contains an Autopass Demo project - a prototype for vendor management system.

### Project Structure

React + TypeScript + Mantine UI prototype project. Source lives at the repo root (`package.json`, `src/`, `vite.config.ts`).

### Commands

Run from the repo root:

- Build: `npm run build`
- Development server: `npm run dev`
- Linting: `npm run lint`

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
1. 啟動開發服務器：`npm run dev`（在 repo 根目錄執行）
2. 在瀏覽器打開 Vite 顯示的 Local URL（預設 http://localhost:5173，被佔用時會自動往後找）
3. 修改代碼後會自動更新頁面