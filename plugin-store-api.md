# 插件商店 API 设计

## 🌐 API 端点设计

### 插件列表
```http
GET /api/v1/plugins
Query Parameters:
- category: string (可选)
- search: string (可选)
- page: number (默认 1)
- limit: number (默认 20)
- sort: "downloads" | "rating" | "updated" | "created"
- featured: boolean (可选)
```

### 插件详情
```http
GET /api/v1/plugins/{pluginId}
```

### 插件下载
```http
GET /api/v1/plugins/{pluginId}/download
Headers:
- User-Agent: UniHub/1.0.0
- X-Client-Version: 1.0.0
```

### 插件提交
```http
POST /api/v1/plugins/submit
Content-Type: multipart/form-data
Body:
- file: plugin.zip
- metadata: JSON
```

### 插件更新
```http
PUT /api/v1/plugins/{pluginId}
Authorization: Bearer {token}
```

## 📊 数据库设计

### plugins 表
```sql
CREATE TABLE plugins (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50) NOT NULL,
  author_id VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  keywords JSON,
  icon_url VARCHAR(500),
  download_url VARCHAR(500) NOT NULL,
  homepage_url VARCHAR(500),
  repository_url VARCHAR(500),
  downloads_count INT DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_featured (featured),
  INDEX idx_downloads (downloads_count DESC),
  INDEX idx_rating (rating_average DESC)
);
```

### plugin_versions 表
```sql
CREATE TABLE plugin_versions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plugin_id VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  download_url VARCHAR(500) NOT NULL,
  changelog TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (plugin_id) REFERENCES plugins(id),
  UNIQUE KEY unique_plugin_version (plugin_id, version)
);
```

### plugin_reviews 表
```sql
CREATE TABLE plugin_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plugin_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (plugin_id) REFERENCES plugins(id),
  UNIQUE KEY unique_user_review (plugin_id, user_id)
);
```

## 🔐 安全措施

### 文件扫描
- 病毒扫描 (ClamAV)
- 恶意代码检测
- 依赖安全检查

### 权限控制
- JWT 认证
- 角色权限管理
- API 限流

### 内容审核
- 自动化检查
- 人工审核
- 社区举报