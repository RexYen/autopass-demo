# Git操作指南 - 完全新手版

> 本指南專為程式新手設計，包含完整的Git基本操作流程

## 🤔 Git是什麼？

把Git想像成**程式碼的相簿**：
- 每次拍照（commit）都會保存當下程式碼的完整狀態
- 可以回到任何一個拍照的時間點
- 可以看到每次拍照之間有什麼變化

## 📍 前置準備：打開Terminal

### Mac系統
- 按 `Cmd + 空白鍵` 搜尋 "Terminal" 或 "終端機"
- 或在Finder中進入「應用程式」>「工具程式」>「終端機」

### Windows系統
- 按 `Win + R` 輸入 `cmd` 按Enter
- 或搜尋 "命令提示字元" 或 "PowerShell"

---

## 🚀 完整操作步驟

### Step 1：確認Git已安裝

**您需要輸入：**
```bash
git --version
```

**預期結果：**
```
git version 2.x.x (Apple Git-xxx)
```

**如果顯示找不到git**：需要先安裝Git
- Mac：安裝Xcode Command Line Tools 或從 https://git-scm.com 下載
- Windows：從 https://git-scm.com 下載安裝

---

### Step 2：設定您的身份（終身只需做一次）

**您需要輸入（請替換成您的真實資訊）：**
```bash
git config --global user.name "您的真實姓名"
git config --global user.email "您的email@example.com"
```

**實際範例：**
```bash
git config --global user.name "Rex Yen"
git config --global user.email "kirtio0504@gmail.com"
```

**為什麼要這樣做？**
- Git需要知道每次commit是誰做的
- 這資訊會記錄在commit歷史中
- 只需要設定一次，之後所有專案都會使用這個設定

---

### Step 3：進入您的專案目錄

**您需要輸入：**
```bash
cd /Users/yanshaoyu/Desktop/claudelab/autopass-demo
```

**小技巧：**
- 也可以在Finder中右鍵專案資料夾選擇"在終端機中打開"
- 或直接把資料夾拖拽到Terminal視窗中

---

### Step 4：初始化Git倉庫

**您需要輸入：**
```bash
git init
```

**預期結果：**
```
Initialized empty Git repository in /Users/yanshaoyu/Desktop/claudelab/autopass-demo/.git/
```

**這做了什麼？**
- 在您的專案資料夾中創建了一個隱藏的 `.git` 資料夾
- 這個資料夾就是Git的「相簿」，會儲存所有版本記錄

---

### Step 5：查看目前狀態

**您需要輸入：**
```bash
git status
```

**會看到類似：**
```
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .gitignore
        README.md
        package.json
        src/
        public/
        ...

nothing added to commit but untracked files present (use "git add" to track)
```

**狀態解釋：**
- 🔴 `Untracked files` = 還沒被Git追蹤的檔案（新檔案）
- 這些檔案還沒有被加入Git的管理中

---

### Step 6：加入檔案到暫存區

**您需要輸入：**
```bash
git add .
```

**這個指令的意思：**
- `git add` = 準備拍照
- `.` = 當前目錄的所有檔案
- 把所有檔案都準備好要拍照

**也可以單獨加入檔案：**
```bash
git add package.json          # 只加入單一檔案
git add src/                  # 只加入某個資料夾
```

---

### Step 7：再次檢查狀態

**您需要輸入：**
```bash
git status
```

**現在會看到：**
```
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   .gitignore
        new file:   README.md
        new file:   package.json
        new file:   src/App.tsx
        ...
```

**狀態解釋：**
- ✅ `Changes to be committed` = 準備好要拍照的檔案
- 所有檔案現在都在「暫存區」，準備被commit

---

### Step 8：創建第一個commit（拍照）

**您需要輸入：**
```bash
git commit -m "完成業者管理頁面第一階段

✅ 實現功能：
- 業者管理完整界面
- 響應式設計支援2160px寬螢幕
- 側邊導航含Logo
- 搜尋功能
- 資料表格展示
- 分頁控制

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

**預期結果：**
```
[main (root-commit) abc1234] 完成業者管理頁面第一階段
 21 files changed, 5137 insertions(+)
 create mode 100644 README.md
 create mode 100644 package.json
 ...
```

**Commit Message格式建議：**
- 第一行：簡短描述做了什麼
- 空一行
- 詳細說明：列出具體功能或變更

---

### Step 9：確認commit成功

**您需要輸入：**
```bash
git log --oneline
```

**會看到：**
```
abc1234 完成業者管理頁面第一階段
```

**查看更詳細的歷史：**
```bash
git log
```

---

## 🔄 日常開發工作流程

### 當您完成新功能時，重複這個流程：

#### 1. 查看有什麼改變
```bash
git status
```

#### 2. 查看具體改了什麼（可選）
```bash
git diff                    # 看所有變更的詳細內容
git diff filename.txt       # 看特定檔案的變更
```

#### 3. 加入要保存的檔案
```bash
git add .                   # 加入所有變更
git add src/NewPage.tsx     # 只加入特定檔案
```

#### 4. 創建新的commit
```bash
git commit -m "添加任務管理頁面

✅ 新增功能：
- 任務列表展示
- 任務狀態切換  
- 搜尋和篩選功能"
```

#### 5. 查看歷史記錄（可選）
```bash
git log --oneline           # 簡潔版本
git log                     # 詳細版本
```

---

## 📋 常用Git指令速查表

### 📊 查看狀態類
```bash
git status                  # 查看目前狀態
git log                     # 查看詳細commit歷史
git log --oneline          # 查看簡潔commit歷史
git diff                   # 查看尚未暫存的變更
git diff --staged          # 查看已暫存的變更
git show                   # 查看最新commit的詳細內容
```

### 📝 操作類
```bash
git add .                  # 加入所有檔案到暫存區
git add filename.txt       # 加入特定檔案到暫存區
git commit -m "訊息"       # 創建commit
git commit -am "訊息"      # 加入所有已追蹤檔案並commit
```

### ↩️ 撤銷類
```bash
git checkout .             # 捨棄所有尚未commit的變更
git checkout filename.txt  # 捨棄特定檔案的變更
git reset HEAD filename.txt # 將檔案從暫存區移除
git reset HEAD~1           # 撤銷最後一次commit（保留變更）
git reset --hard HEAD~1    # 撤銷最後一次commit（完全刪除變更）⚠️危險
```

### 🔍 瀏覽歷史類
```bash
git log --oneline          # 簡潔的commit歷史
git log --graph            # 圖形化顯示分支
git checkout abc1234       # 暫時回到特定commit查看（只是瀏覽）
git checkout main          # 回到最新版本
```

---

## 🚨 重要注意事項

### ✅ 好習慣
1. **經常commit**：每完成一個小功能就commit
2. **寫清楚的commit message**：方便以後查找和理解
3. **commit前檢查狀態**：用 `git status` 確認要commit什麼
4. **不要commit大檔案**：如影片、大型圖片等
5. **不要commit敏感資訊**：如密碼、API金鑰、個人資料

### ❌ 避免的事情
1. **不要commit未完成的功能**：確保commit的程式碼可以運行
2. **不要用沒意義的commit message**：如"update"、"fix"
3. **不要一次commit太多不相關的變更**：一個commit做一件事

### 🔥 緊急情況處理

**如果commit錯了訊息：**
```bash
git commit --amend -m "新的commit訊息"
```

**如果不小心add錯檔案：**
```bash
git reset HEAD filename.txt    # 將特定檔案從暫存區移除
git reset HEAD                 # 將所有檔案從暫存區移除
```

**如果想完全回到上一個commit的狀態：**
```bash
git reset --hard HEAD~1        # ⚠️ 會永久刪除變更，小心使用
```

---

## 🎯 下次開發時的步驟

### 當您畫完其他Figma頁面，準備繼續開發時：

1. **打開Terminal並進入專案：**
   ```bash
   cd /Users/yanshaoyu/Desktop/claudelab/autopass-demo
   ```

2. **啟動開發服務器：**
   ```bash
   npm run dev
   ```

3. **開始開發新功能...**

4. **完成後保存進度：**
   ```bash
   git add .
   git commit -m "完成任務管理頁面

   ✅ 新增功能：
   - 任務列表展示
   - 任務狀態管理
   - 篩選和搜尋功能"
   ```

5. **檢查commit歷史：**
   ```bash
   git log --oneline
   ```

---

## 🆘 遇到問題時

### 常見錯誤訊息和解決方法

**`fatal: not a git repository`**
- 您不在Git專案目錄中
- 解決：`cd` 到正確的專案目錄，或執行 `git init`

**`nothing to commit, working tree clean`**
- 沒有任何變更需要commit
- 這是正常情況，表示所有變更都已經commit了

**`Your branch is ahead of 'origin/main' by X commits`**
- 您的本地版本比遠端版本新
- 如果沒有使用GitHub等遠端倉庫，可以忽略

**檔案無法add（permission denied）**
- 檔案權限問題
- 解決：檢查檔案權限或用 `sudo` （但通常不建議）

---

## 🎓 學習心得

1. **Git是程式開發的必備技能**：幾乎所有程式專案都會用到
2. **多練習就會熟練**：剛開始可能覺得複雜，但用幾次就會上手
3. **commit message很重要**：寫清楚的訊息是專業素養
4. **不要害怕犯錯**：Git的設計就是為了讓您可以安全地實驗和回復

---

## 📚 更進階的學習資源

- [Git官方教學](https://git-scm.com/book/zh-tw/v2)
- [GitHub官方Git手冊](https://guides.github.com/)
- 推薦練習網站：[Learn Git Branching](https://learngitbranching.js.org/?locale=zh_TW)

---

**🎉 恭喜！您已經學會Git的基本操作了！**

記住：**多練習、不要怕**。Git是程式設計師最重要的工具之一，熟練使用Git會讓您的開發工作更有效率也更安全。