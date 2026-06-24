import {
  Paper,
  Title,
  Group,
  Button,
  TextInput,
  Table,
  Badge,
  Pagination,
  Text,
  Box,
  Modal,
  Stack,
  Select,
  Checkbox,
  SegmentedControl,
  Textarea,
} from '@mantine/core'
import {
  IconPlus,
  IconSearch,
  IconMap,
  IconList,
  IconFilter,
  IconEdit,
  IconEye,
} from '@tabler/icons-react'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useNotification } from '../hooks/useNotification'
import { PlaceDetail } from './PlaceDetail'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom CSS for popup z-index
const customPopupStyles = `
  .leaflet-popup-pane {
    z-index: 2000 !important;
  }
  .leaflet-popup {
    z-index: 2000 !important;
    position: absolute !important;
  }
  .leaflet-popup-content-wrapper {
    z-index: 2000 !important;
    border-radius: 8px !important;
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.3) !important;
    background: white !important;
    border: 2px solid #228be6 !important;
    max-width: 380px !important;
    min-width: 300px !important;
    max-height: 400px !important;
    overflow: visible !important;
  }
  .leaflet-popup-tip {
    z-index: 2000 !important;
    background: white !important;
    border: 1px solid #228be6 !important;
  }
  .custom-popup .leaflet-popup-content {
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1.4 !important;
    overflow: visible !important;
    width: auto !important;
    max-height: 350px !important;
  }
  .custom-popup .leaflet-popup-content-wrapper {
    padding: 0 !important;
    overflow: visible !important;
  }
  .leaflet-popup-close-button {
    z-index: 2100 !important;
    color: #228be6 !important;
    font-size: 20px !important;
    font-weight: bold !important;
    right: 8px !important;
    top: 8px !important;
  }
  .leaflet-container {
    position: relative !important;
    z-index: 1 !important;
  }
  .leaflet-map-pane {
    z-index: 1 !important;
  }
  /* 確保彈窗不會被左側面板遮蓋 */
  .leaflet-popup {
    pointer-events: auto !important;
  }
  .leaflet-popup-content-wrapper {
    pointer-events: auto !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customPopupStyles;
  document.head.appendChild(styleSheet);
}

// 服務、停車場與充電站詳細資訊的最小精確型別（依 mockMapResources 形狀推導）
interface MapService {
  type: string
  name: string
  status: string
}

interface ParkingInfo {
  totalSpaces: number
  availableSpaces: number
  hourlyRate: number
  maxDailyRate: number
  operatingHours: string
  vehicleTypes: string[]
  features?: string[]
}

interface ChargingInfo {
  totalChargers: number
  availableChargers: number
  chargerTypes: string[]
  pricing: string
  networkProvider: string
  paymentMethods: string[]
}

// 圖資資源（mock 資料中的每一筆）
interface MapResource {
  id: number
  placeName: string
  address: string
  coordinates: string
  latitude: number
  longitude: number
  serviceTypes: string[]
  vendor: string
  status: string
  remarks: string
  createdAt: string
  services?: MapService[]
  parkingInfo?: ParkingInfo
  chargingInfo?: ChargingInfo
}

// useMemo 篩選後在資源上附加的搜尋欄位
interface FilteredMapResource extends MapResource {
  searchDistance?: number
  matches: boolean
}

// 新增地點時建立、傳給 PlaceDetail 的物件形狀
// 新增地點的表單結果：與 MapResource 同形，再加上街景網址
interface NewPlace extends MapResource {
  streetViewUrl: string
}

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different service types
const createCustomIcon = (serviceTypes: string[], status: string) => {
  const getColor = () => {
    if (status === '營運中') return '#12b886';
    if (status === '維護中') return '#fab005';
    return '#fa5252';
  };

  const getIconHtml = () => {
    if (serviceTypes.includes('停車場') && serviceTypes.includes('充電站')) {
      return `<div style="background: ${getColor()}; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">P+</div>`;
    } else if (serviceTypes.includes('充電站')) {
      return `<div style="background: ${getColor()}; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">⚡</div>`;
    } else {
      return `<div style="background: ${getColor()}; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">P</div>`;
    }
  };

  return L.divIcon({
    html: getIconHtml(),
    className: 'custom-div-icon',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
  });
};

// Mock data for map resources - based on ERD architecture
const mockMapResources: MapResource[] = [
  {
    id: 1,
    placeName: '台北101停車場',
    address: '台北市信義區信義路五段7號',
    coordinates: '25.0330, 121.5654',
    latitude: 25.0330,
    longitude: 121.5654,
    serviceTypes: ['停車場', '充電站'],
    vendor: '世潮企業股份有限公司',
    status: '營運中',
    remarks: '地下停車場，提供充電服務',
    createdAt: '2024-01-15',
    // 服務列表
    services: [
      {
        type: '停車場',
        name: '台北101地下停車場',
        status: '營運中'
      },
      {
        type: '充電站',
        name: '台北101超級充電站',
        status: '營運中'
      }
    ],
    // 停車場詳細資訊
    parkingInfo: {
      totalSpaces: 850,
      availableSpaces: 245,
      hourlyRate: 30,
      maxDailyRate: 200,
      operatingHours: '24小時',
      vehicleTypes: ['汽車', '機車'],
      features: ['無障礙車位', '女性專用車位', '電動車充電'],
    },
    // 充電站詳細資訊
    chargingInfo: {
      totalChargers: 12,
      availableChargers: 8,
      chargerTypes: ['AC 22kW', 'DC 50kW', 'DC 150kW'],
      pricing: 'AC: 8元/kWh, DC: 12元/kWh',
      networkProvider: 'Tesla Supercharger',
      paymentMethods: ['信用卡', '悠遊卡', 'App付款'],
    },
  },
  {
    id: 2,
    placeName: '中正紀念堂停車場',
    address: '台北市中正區中山南路21號',
    coordinates: '25.0360, 121.5200',
    latitude: 25.0360,
    longitude: 121.5200,
    serviceTypes: ['停車場'],
    vendor: '經國能源股份有限公司平鎮分公司',
    status: '營運中',
    remarks: '戶外停車場',
    createdAt: '2024-01-20',
    // 服務列表
    services: [
      {
        type: '停車場',
        name: '中正紀念堂戶外停車場',
        status: '營運中'
      }
    ],
    parkingInfo: {
      totalSpaces: 320,
      availableSpaces: 89,
      hourlyRate: 20,
      maxDailyRate: 150,
      operatingHours: '06:00-22:00',
      vehicleTypes: ['汽車'],
      features: ['無障礙車位'],
    },
  },
  {
    id: 3,
    placeName: '台北車站充電站',
    address: '台北市中正區北平西路3號',
    coordinates: '25.0478, 121.5170',
    latitude: 25.0478,
    longitude: 121.5170,
    serviceTypes: ['充電站'],
    vendor: '連展電能科技股份有限公司',
    status: '維護中',
    remarks: '快充站點，暫停服務進行設備更新',
    createdAt: '2024-02-01',
    // 服務列表
    services: [
      {
        type: '充電站',
        name: '台北車站7-ELEVEN快充站',
        status: '維護中'
      }
    ],
    chargingInfo: {
      totalChargers: 6,
      availableChargers: 0,
      chargerTypes: ['DC 120kW', 'DC 200kW'],
      pricing: 'DC: 15元/kWh',
      networkProvider: '7-ELEVEN充電站',
      paymentMethods: ['信用卡', 'iCash', 'App付款'],
    },
  },
  {
    id: 4,
    placeName: '西門町停車場',
    address: '台北市萬華區峨嵋街52號',
    coordinates: '25.0418, 121.5081',
    latitude: 25.0418,
    longitude: 121.5081,
    serviceTypes: ['停車場', '充電站'],
    vendor: '車容坊股份有限公司鳳壹營業所',
    status: '營運中',
    remarks: '24小時營業，設有快充設備',
    createdAt: '2024-02-10',
    // 服務列表
    services: [
      {
        type: '停車場',
        name: '西門町24H停車場',
        status: '營運中'
      },
      {
        type: '充電站',
        name: '西門町U-POWER充電站',
        status: '營運中'
      }
    ],
    parkingInfo: {
      totalSpaces: 450,
      availableSpaces: 123,
      hourlyRate: 40,
      maxDailyRate: 250,
      operatingHours: '24小時',
      vehicleTypes: ['汽車', '機車'],
      features: ['無障礙車位', '電動車充電', '洗車服務'],
    },
    chargingInfo: {
      totalChargers: 8,
      availableChargers: 3,
      chargerTypes: ['AC 7kW', 'DC 60kW'],
      pricing: 'AC: 6元/kWh, DC: 10元/kWh',
      networkProvider: 'U-POWER',
      paymentMethods: ['信用卡', '悠遊卡'],
    },
  },
  {
    id: 5,
    placeName: '士林夜市停車場',
    address: '台北市士林區大東路17號',
    coordinates: '25.0881, 121.5241',
    latitude: 25.0881,
    longitude: 121.5241,
    serviceTypes: ['停車場'],
    vendor: '坤業加油站有限公司莒光路營業所',
    status: '營運中',
    remarks: '夜市專用停車場',
    createdAt: '2024-02-15',
    // 服務列表
    services: [
      {
        type: '停車場',
        name: '士林夜市專用停車場',
        status: '營運中'
      }
    ],
    parkingInfo: {
      totalSpaces: 180,
      availableSpaces: 45,
      hourlyRate: 25,
      maxDailyRate: 120,
      operatingHours: '17:00-02:00',
      vehicleTypes: ['汽車', '機車'],
      features: ['夜市專用', '機車專區'],
    },
  },
]

const serviceTypeOptions = ['停車場', '充電站']
const statusOptions = ['營運中', '維護中', '暫停營運']

// 使用 Haversine 公式計算兩個經緯度座標之間的距離（公尺）
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // 地球半徑（公尺）
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 距離（公尺）
}

// 解析搜尋輸入是否為經緯度格式
const parseCoordinates = (input: string): { lat: number; lng: number } | null => {
  // 支援多種格式：
  // 25.0330, 121.5654
  // 25.0330,121.5654
  // 25.0330 121.5654
  const coordRegex = /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/;
  const match = input.trim().match(coordRegex);
  
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    
    // 基本範圍檢查（台灣地區）
    if (lat >= 21 && lat <= 26 && lng >= 119 && lng <= 123) {
      return { lat, lng };
    }
  }
  
  return null;
}

interface MapManagementProps {
  onViewDetail?: (resourceId: number) => void;
}

export function MapManagement({ onViewDetail }: MapManagementProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterServiceType, setFilterServiceType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedResources, setSelectedResources] = useState<number[]>([]);
  const [isBatchEditOpen, setIsBatchEditOpen] = useState(false);
  const [batchRemarks, setBatchRemarks] = useState('');
  const [isServiceDetailOpen, setIsServiceDetailOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<MapResource | null>(null);
  const [isAddPlaceModalOpen, setIsAddPlaceModalOpen] = useState(false);
  const [newPlaceForm, setNewPlaceForm] = useState({
    placeName: '',
    address: '',
    streetViewUrl: ''
  });
  const [showPlaceDetail, setShowPlaceDetail] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<NewPlace | null>(null);

  // Map related state
  const [selectedMarker, setSelectedMarker] = useState<FilteredMapResource | null>(null);
  const [activeMarkerId, setActiveMarkerId] = useState<number | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  
  const { showSuccess } = useNotification();

  // 使用 useMemo 穩健地處理搜尋邏輯
  const searchResult = React.useMemo(() => {
    // 解析搜尋輸入
    const coordinates = searchTerm.trim() ? parseCoordinates(searchTerm) : null;
    const isCoordinateSearch = coordinates !== null;
    
    // 篩選和處理資源
    const filtered = mockMapResources.map(resource => {
      let distance: number | undefined = undefined;
      let matchesSearch = false;
      
      if (!searchTerm.trim()) {
        matchesSearch = true;
      } else if (isCoordinateSearch) {
        // 經緯度搜尋
        distance = calculateDistance(
          coordinates!.lat, 
          coordinates!.lng, 
          resource.latitude, 
          resource.longitude
        );
        matchesSearch = distance <= 30; // 30公尺範圍
      } else {
        // 文字搜尋 - 包含場所名稱、地址和服務名稱
        const searchLower = searchTerm.toLowerCase();
        matchesSearch = resource.placeName.toLowerCase().includes(searchLower) ||
                       resource.address.toLowerCase().includes(searchLower) ||
                       (resource.services?.some((service) =>
                         service.name.toLowerCase().includes(searchLower)
                       ) ?? false);
      }
      
      const matchesServiceType = !filterServiceType || resource.serviceTypes.includes(filterServiceType);
      const matchesStatus = !filterStatus || resource.status === filterStatus;
      
      return {
        ...resource,
        searchDistance: distance,
        matches: matchesSearch && matchesServiceType && matchesStatus
      };
    }).filter(resource => resource.matches);
    
    return {
      resources: filtered,
      searchCoordinates: coordinates,
      isCoordinateSearch
    };
  }, [searchTerm, filterServiceType, filterStatus]);

  const filteredResources = searchResult.resources;

  const handleResourceSelect = (resourceId: number, checked: boolean) => {
    if (checked) {
      setSelectedResources(prev => [...prev, resourceId]);
    } else {
      setSelectedResources(prev => prev.filter(id => id !== resourceId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResources(filteredResources.map(r => r.id));
    } else {
      setSelectedResources([]);
    }
  };

  const handleBatchEdit = () => {
    if (selectedResources.length > 0 && batchRemarks.trim()) {
      console.log('批次編輯備註:', {
        resourceIds: selectedResources,
        remarks: batchRemarks
      });
      
      showSuccess(`已更新 ${selectedResources.length} 筆資源的備註`, '批次編輯成功');
      
      setSelectedResources([]);
      setBatchRemarks('');
      setIsBatchEditOpen(false);
    }
  };

  const handleServiceDetailClick = (resource: MapResource) => {
    setSelectedResource(resource);
    setIsServiceDetailOpen(true);
  };

  // 模擬Google街景網址轉換經緯度
  const parseStreetViewUrl = (url: string): { latitude: number; longitude: number } | null => {
    // 模擬解析Google街景網址，實際應該使用Google Maps API
    // 這裡用簡單的mock數據模擬
    const mockCoordinates = [
      { latitude: 25.0330, longitude: 121.5654 }, // 台北101
      { latitude: 25.0360, longitude: 121.5200 }, // 中正紀念堂
      { latitude: 25.0478, longitude: 121.5170 }, // 台北車站
      { latitude: 25.0418, longitude: 121.5081 }, // 西門町
      { latitude: 25.0881, longitude: 121.5241 }, // 士林
    ];
    
    if (url.trim()) {
      // 隨機返回一個座標（實際應該解析URL）
      const randomIndex = Math.floor(Math.random() * mockCoordinates.length);
      return mockCoordinates[randomIndex];
    }
    
    return null;
  };

  const handleAddPlace = () => {
    if (!newPlaceForm.placeName || !newPlaceForm.address || !newPlaceForm.streetViewUrl) {
      return;
    }

    try {
      const coordinates = parseStreetViewUrl(newPlaceForm.streetViewUrl);
      if (!coordinates) {
        showSuccess('無法解析街景網址座標', '錯誤');
        return;
      }

      const newPlace = {
        id: Date.now(), // 簡單的ID生成
        placeName: newPlaceForm.placeName,
        address: newPlaceForm.address,
        streetViewUrl: newPlaceForm.streetViewUrl,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        coordinates: `${coordinates.latitude}, ${coordinates.longitude}`,
        serviceTypes: [], // 初始為空，後續在詳情頁添加服務
        vendor: '', // 待設定
        status: '籌備中', // 新建地點初始狀態
        remarks: '',
        createdAt: new Date().toLocaleDateString(),
      };

      console.log('新增地點:', newPlace);
      showSuccess('地點基本資訊已建立，請繼續設定服務內容', '新增成功');
      
      // 清空表單並關閉Modal
      setNewPlaceForm({ placeName: '', address: '', streetViewUrl: '' });
      setIsAddPlaceModalOpen(false);
      
      // 跳轉到地點詳情頁面
      console.log('跳轉到詳情頁面，地點:', newPlace);
      setSelectedPlace(newPlace);
      setShowPlaceDetail(true);
    } catch (error) {
      console.error('新增地點時發生錯誤:', error);
      showSuccess('新增地點時發生錯誤', '錯誤');
    }
  };

  const onMarkerClick = useCallback((resource: FilteredMapResource) => {
    setSelectedMarker(resource);
    setActiveMarkerId(resource.id);
  }, []);


  const onListItemClick = useCallback((resource: FilteredMapResource) => {
    setSelectedMarker(resource);
    setActiveMarkerId(resource.id);
  }, []);

  // Auto open popup when activeMarkerId changes
  useEffect(() => {
    if (activeMarkerId && markersRef.current.has(activeMarkerId)) {
      const markerRef = markersRef.current.get(activeMarkerId);
      if (markerRef) {
        // Use multiple attempts to ensure popup opens
        const openPopup = () => {
          try {
            markerRef.openPopup();
          } catch {
            setTimeout(openPopup, 50);
          }
        };
        setTimeout(openPopup, 100);
      }
    }
  }, [activeMarkerId]);

  // Map Controller Component
  function MapController({ targetResource }: { targetResource: FilteredMapResource | null }) {
    const map = useMap();
    
    React.useEffect(() => {
      if (targetResource) {
        map.setView([targetResource.latitude, targetResource.longitude], 15);
      }
    }, [map, targetResource]);
    
    return null;
  }


  // 如果正在顯示地點詳情，則渲染詳情頁面
  if (showPlaceDetail && selectedPlace) {
    return (
      <PlaceDetail 
        place={selectedPlace}
        onBack={() => {
          setShowPlaceDetail(false);
          setSelectedPlace(null);
        }}
      />
    );
  }

  return (
    <Paper 
      shadow="0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)"
      radius="16px" 
      style={{ 
        minHeight: '760px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {/* Header */}
      <Group 
        justify="space-between" 
        px="20px" 
        py="24px"
        style={{ 
          borderBottom: 'none',
          flexShrink: 0,
        }}
      >
        <Title 
          order={2} 
          style={{
            color: '#000000',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '24px',
            fontFamily: 'Noto Sans TC, sans-serif',
          }}
        >
          圖資管理
        </Title>
        <Group gap="12px">
          {selectedResources.length > 0 && (
            <Button
              leftSection={<IconEdit size={16} />}
              onClick={() => setIsBatchEditOpen(true)}
              variant="outline"
              style={{
                borderColor: '#228be6',
                color: '#228be6',
                height: '40px',
                padding: '8px 20px',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '24px',
              }}
            >
              批次編輯 ({selectedResources.length})
            </Button>
          )}
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsAddPlaceModalOpen(true)}
            style={{
              backgroundColor: '#228be6',
              color: '#ffffff',
              height: '40px',
              padding: '8px 20px',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '24px',
            }}
          >
            新增圖資
          </Button>
        </Group>
      </Group>

      {/* Controls */}
      <Box px="20px" pb="24px" style={{ flexShrink: 0 }}>
        <Group gap="16px" align="end">
          {/* Search */}
          <TextInput
            placeholder="請輸入場所名稱、地址、服務名稱或經緯度"
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.currentTarget.value)}
            style={{ 
              maxWidth: '450px',
              width: '100%'
            }}
            styles={{
              input: {
                borderColor: '#dee2e6',
                borderRadius: '4px',
                height: '40px',
                fontSize: '14px',
                lineHeight: '20px',
                '&::placeholder': {
                  color: '#adb5bd',
                },
              },
            }}
          />

          {/* Filters */}
          <Select
            placeholder="服務類型"
            data={serviceTypeOptions}
            value={filterServiceType}
            onChange={setFilterServiceType}
            clearable
            leftSection={<IconFilter size={16} />}
            style={{ width: '150px' }}
            styles={{
              input: {
                borderColor: '#dee2e6',
                borderRadius: '4px',
                height: '40px',
                fontSize: '14px',
                lineHeight: '20px',
              },
            }}
          />

          <Select
            placeholder="營運狀態"
            data={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            clearable
            leftSection={<IconFilter size={16} />}
            style={{ width: '150px' }}
            styles={{
              input: {
                borderColor: '#dee2e6',
                borderRadius: '4px',
                height: '40px',
                fontSize: '14px',
                lineHeight: '20px',
              },
            }}
          />

          {/* View Mode Toggle */}
          <SegmentedControl
            value={viewMode}
            onChange={(value) => setViewMode(value as 'list' | 'map')}
            data={[
              { label: <Group gap="8px"><IconList size={16} />列表</Group>, value: 'list' },
              { label: <Group gap="8px"><IconMap size={16} />地圖</Group>, value: 'map' },
            ]}
            styles={{
              root: {
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
              },
              control: {
                border: 'none',
                borderRadius: '4px',
                '&[data-active]': {
                  backgroundColor: '#228be6',
                  color: '#ffffff',
                },
              },
            }}
          />
        </Group>
      </Box>

      {/* Content Area */}
      {viewMode === 'list' ? (
        <>
          {/* Table Container */}
          <Box 
            style={{ 
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
            <Table
              withTableBorder={false}
              withRowBorders
              styles={{
                table: {
                  backgroundColor: '#ffffff',
                  width: '100%',
                },
                thead: {
                  backgroundColor: '#ffffff',
                },
                th: {
                  color: '#868e96',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  padding: '12px 20px',
                  height: '50px',
                  borderBottom: '1px solid #dee2e6',
                  fontFamily: 'Noto Sans TC, sans-serif',
                },
                td: {
                  padding: '12px 20px',
                  height: 'auto',
                  minHeight: '50px',
                  borderBottom: '1px solid #dee2e6',
                  verticalAlign: 'middle',
                  overflow: 'visible',
                },
                tr: {
                  backgroundColor: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#ffffff',
                  },
                },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: '50px' }}>
                    <Checkbox
                      checked={selectedResources.length === filteredResources.length && filteredResources.length > 0}
                      indeterminate={selectedResources.length > 0 && selectedResources.length < filteredResources.length}
                      onChange={(event) => handleSelectAll(event.currentTarget.checked)}
                      size="sm"
                    />
                  </Table.Th>
                  <Table.Th style={{ width: '25%' }}>場所名稱</Table.Th>
                  <Table.Th style={{ width: '30%' }}>地址</Table.Th>
                  <Table.Th style={{ width: '15%' }}>經緯度</Table.Th>
                  <Table.Th style={{ width: '15%' }}>服務類型</Table.Th>
                  <Table.Th style={{ width: '10%', textAlign: 'center' }}>營運狀態</Table.Th>
                  <Table.Th style={{ width: '5%' }}>操作</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredResources.map((resource) => (
                  <Table.Tr key={resource.id}>
                    <Table.Td>
                      <Checkbox
                        checked={selectedResources.includes(resource.id)}
                        onChange={(event) => handleResourceSelect(resource.id, event.currentTarget.checked)}
                        size="sm"
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text 
                        onClick={() => onViewDetail?.(resource.id)}
                        style={{
                          color: '#228be6',
                          fontSize: '14px',
                          lineHeight: '20px',
                          fontFamily: 'Noto Sans TC, sans-serif',
                          fontWeight: 400,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        {resource.placeName}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text 
                        style={{
                          color: '#000000',
                          fontSize: '14px',
                          lineHeight: '20px',
                          fontFamily: 'Noto Sans TC, sans-serif',
                          fontWeight: 400,
                        }}
                      >
                        {resource.address}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <div>
                        <Text 
                          style={{
                            color: '#000000',
                            fontSize: '14px',
                            lineHeight: '20px',
                            fontFamily: 'Noto Sans TC, sans-serif',
                            fontWeight: 400,
                          }}
                        >
                          {resource.coordinates}
                        </Text>
                        {resource.searchDistance !== undefined && (
                          <Text 
                            size="xs"
                            style={{
                              color: '#228be6',
                              fontSize: '12px',
                              fontWeight: 500,
                              marginTop: '2px',
                            }}
                          >
                            距離 {Math.round(resource.searchDistance)}m
                          </Text>
                        )}
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="4px" wrap="wrap">
                        {resource.serviceTypes.map((type) => (
                          <Badge
                            key={type}
                            variant="light"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleServiceDetailClick(resource)}
                            styles={{
                              root: {
                                backgroundColor: `rgba(${
                                  type === '停車場' ? '76,110,245' : '18,184,134'
                                },0.1)`,
                                color: '#212529',
                                fontSize: '12px',
                                lineHeight: '16px',
                                fontWeight: 400,
                                padding: '4px 8px',
                                borderRadius: '16px',
                                border: 'none',
                                fontFamily: 'Noto Sans TC, sans-serif',
                              },
                            }}
                          >
                            {type}
                          </Badge>
                        ))}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Badge
                          variant="dot"
                          color={
                            resource.status === '營運中' ? 'green' : 
                            resource.status === '維護中' ? 'yellow' : 'red'
                          }
                          size="sm"
                          styles={{
                            root: {
                              backgroundColor: 'transparent',
                              border: 'none',
                              padding: '0',
                              fontSize: '12px',
                              fontWeight: 400,
                              color: '#212529',
                              fontFamily: 'Noto Sans TC, sans-serif',
                            },
                          }}
                        >
                          {resource.status}
                        </Badge>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => handleServiceDetailClick(resource)}
                        style={{
                          color: '#228be6',
                          padding: '4px 8px',
                        }}
                      >
                        <IconEye size={16} />
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>

          {/* Footer */}
          <Group 
            justify="space-between" 
            px="20px" 
            py="24px"
            style={{ 
              borderTop: 'none',
              flexShrink: 0,
            }}
          >
            <div>
              <Text 
                style={{
                  color: '#868e96',
                  fontSize: '14px',
                  lineHeight: '20px',
                  fontFamily: 'Noto Sans TC, sans-serif',
                }}
              >
                顯示 1 - {filteredResources.length} 筆圖資，共 {mockMapResources.length} 筆
              </Text>
              {searchResult.searchCoordinates && (
                <Text 
                  size="xs"
                  style={{
                    color: '#228be6',
                    fontSize: '12px',
                    marginTop: '2px',
                  }}
                >
                  📍 經緯度搜尋範圍：{searchResult.searchCoordinates.lat}, {searchResult.searchCoordinates.lng} 周邊 30 公尺
                </Text>
              )}
            </div>
            <Pagination 
              total={Math.ceil(filteredResources.length / 10)} 
              value={currentPage}
              onChange={setCurrentPage}
              color="#228be6"
              size="sm"
              styles={{
                control: {
                  width: '24px',
                  height: '24px',
                  minWidth: '24px',
                  fontSize: '14px',
                  lineHeight: '20px',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  
                  '&[data-active]': {
                    backgroundColor: '#228be6',
                    color: '#ffffff',
                    borderColor: '#228be6',
                  },
                  
                  '&[data-active]:hover': {
                    backgroundColor: '#228be6',
                    color: '#ffffff',
                  },
                },
              }}
            />
          </Group>
        </>
      ) : (
        /* Map View */
        <Box 
          style={{ 
            flex: 1,
            display: 'flex',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            margin: '0 20px 20px 20px',
            overflow: 'hidden',
          }}
        >
          {/* Left Panel - Resource List */}
          <Box 
            style={{ 
              width: '400px',
              backgroundColor: '#ffffff',
              borderRight: '1px solid #dee2e6',
              overflow: 'auto',
            }}
          >
            <Box p="16px">
              <Title order={6} mb="16px" style={{ fontSize: '14px', color: '#868e96' }}>
                圖資列表 ({filteredResources.length})
              </Title>
              <Stack gap="8px">
                {filteredResources.map((resource) => (
                  <Paper 
                    key={resource.id}
                    p="12px" 
                    style={{ 
                      border: activeMarkerId === resource.id ? '2px solid #228be6' : '1px solid #dee2e6',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: activeMarkerId === resource.id ? 'rgba(34,139,230,0.05)' : '#ffffff',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => onListItemClick(resource)}
                  >
                    <Box style={{ position: 'relative' }}>
                      {/* 營運狀態圓點 - 右上角 */}
                      <Box
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 
                            resource.status === '營運中' ? '#12b886' : 
                            resource.status === '維護中' ? '#fab005' : '#fa5252'
                        }}
                        title={resource.status}
                      />

                      <Text size="sm" fw={500} mb="4px" style={{ color: '#000', paddingRight: '15px' }}>
                        {resource.placeName}
                      </Text>
                      <Text size="xs" c="dimmed" mb="6px" style={{ lineHeight: '1.3' }}>
                        {resource.address}
                      </Text>
                      
                      {/* 服務名稱列表 */}
                      {resource.services && resource.services.length > 0 && (
                        <div style={{ marginBottom: '6px' }}>
                          {resource.services.map((service, index: number) => (
                            <div key={index} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              marginBottom: '3px' 
                            }}>
                              <Badge
                                size="xs"
                                variant="light"
                                styles={{
                                  root: {
                                    backgroundColor: `rgba(${
                                      service.type === '停車場' ? '76,110,245' : '18,184,134'
                                    },0.15)`,
                                    fontSize: '9px',
                                    padding: '2px 5px',
                                    borderRadius: '10px',
                                    fontWeight: 500,
                                    color: service.type === '停車場' ? '#4c6ef5' : '#12b886'
                                  },
                                }}
                              >
                                {service.type}
                              </Badge>
                              <Text size="xs" style={{ 
                                color: '#495057', 
                                fontSize: '11px', 
                                lineHeight: '1.2',
                                fontWeight: 500
                              }}>
                                {service.name}
                              </Text>
                            </div>
                          ))}
                        </div>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Box>

          {/* Right Panel - Map */}
          <Box 
            style={{ 
              flex: 1,
              position: 'relative',
            }}
          >
            <MapContainer
              center={[25.0330, 121.5654]}
              zoom={11}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController targetResource={selectedMarker} />
              {filteredResources.map((resource) => (
                <Marker
                  key={resource.id}
                  position={[resource.latitude, resource.longitude]}
                  icon={createCustomIcon(resource.serviceTypes, resource.status)}
                  ref={(ref) => {
                    if (ref) {
                      markersRef.current.set(resource.id, ref);
                    }
                  }}
                  eventHandlers={{
                    click: () => onMarkerClick(resource),
                  }}
                >
                  {activeMarkerId === resource.id && (
                    <Popup 
                      closeButton={true}
                      minWidth={300}
                      maxWidth={380}
                      className="custom-popup"
                      autoPan={true}
                      keepInView={true}
                      autoPanPadding={[50, 50]}
                      offset={[0, -5]}
                      eventHandlers={{
                        remove: () => {
                          setSelectedMarker(null);
                          setActiveMarkerId(null);
                        }
                      }}
                    >
                      <div style={{ 
                        padding: '12px',
                        maxHeight: '350px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                      }}>
                        {/* 基本資訊 */}
                        <div style={{ 
                          marginBottom: '12px',
                          flexShrink: 0 // Prevent basic info from shrinking
                        }}>
                          <Text fw={600} mb="4px" style={{ fontSize: '14px', color: '#000' }}>
                            {resource.placeName}
                          </Text>
                          <Text size="xs" mb="6px" style={{ color: '#666', lineHeight: '1.4' }}>
                            {resource.address}
                          </Text>
                          <div style={{ marginBottom: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {resource.serviceTypes.map((type: string) => (
                              <span
                                key={type}
                                style={{
                                  backgroundColor: `rgba(${
                                    type === '停車場' ? '76,110,245' : '18,184,134'
                                  },0.1)`,
                                  color: '#212529',
                                  fontSize: '10px',
                                  padding: '2px 6px',
                                  borderRadius: '12px',
                                  border: 'none',
                                  fontFamily: 'Noto Sans TC, sans-serif',
                                }}
                              >
                                {type}
                              </span>
                            ))}
                            <span
                              style={{
                                backgroundColor: `rgba(${
                                  resource.status === '營運中' ? '18,184,134' : 
                                  resource.status === '維護中' ? '250,176,5' : '250,82,82'
                                },0.1)`,
                                color: '#212529',
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '12px',
                                border: 'none',
                                fontFamily: 'Noto Sans TC, sans-serif',
                              }}
                            >
                              {resource.status}
                            </span>
                          </div>
                        </div>

                        {/* 分隔線 */}
                        <div style={{ 
                          borderTop: '1px solid #dee2e6', 
                          margin: '12px 0',
                          flexShrink: 0 // Prevent separator from shrinking
                        }} />

                        {/* 詳細資訊 */}
                        <div style={{ 
                          flex: 1,
                          maxHeight: '180px', 
                          overflowY: 'auto',
                          overflowX: 'hidden',
                          paddingRight: '4px', // Add some padding for scrollbar
                          minHeight: 0 // Allow flex item to shrink
                        }}>
                          {resource.parkingInfo && (
                            <div style={{ marginBottom: '12px' }}>
                              <div style={{ 
                                fontSize: '12px', 
                                fontWeight: 600, 
                                color: '#4c6ef5', 
                                marginBottom: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                🅿️ 停車場資訊
                              </div>
                              <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.4' }}>
                                <div style={{ marginBottom: '2px' }}>
                                  <span style={{ fontWeight: 500 }}>車位：</span>
                                  {resource.parkingInfo.availableSpaces}/{resource.parkingInfo.totalSpaces} 可用
                                </div>
                                <div style={{ marginBottom: '2px' }}>
                                  <span style={{ fontWeight: 500 }}>費率：</span>
                                  {resource.parkingInfo.hourlyRate}元/小時 (日最高{resource.parkingInfo.maxDailyRate}元)
                                </div>
                                <div style={{ marginBottom: '2px' }}>
                                  <span style={{ fontWeight: 500 }}>營業時間：</span>
                                  {resource.parkingInfo.operatingHours}
                                </div>
                                <div style={{ marginBottom: '2px' }}>
                                  <span style={{ fontWeight: 500 }}>車種：</span>
                                  {resource.parkingInfo.vehicleTypes.join('、')}
                                </div>
                                {resource.parkingInfo.features && (
                                  <div>
                                    <span style={{ fontWeight: 500 }}>設施：</span>
                                    {resource.parkingInfo.features.join('、')}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {resource.chargingInfo && (
                            <div style={{ marginBottom: '12px' }}>
                              <div style={{ 
                                fontSize: '12px', 
                                fontWeight: 600, 
                                color: '#12b886', 
                                marginBottom: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                ⚡ 充電站資訊
                              </div>
                              <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.4' }}>
                                <div style={{ marginBottom: '2px' }}>
                                  <span style={{ fontWeight: 500 }}>充電樁：</span>
                                  {resource.chargingInfo.availableChargers}/{resource.chargingInfo.totalChargers} 可用
                                </div>
                                <div style={{ marginBottom: '2px' }}>
                                  <span style={{ fontWeight: 500 }}>類型：</span>
                                  {resource.chargingInfo.chargerTypes.join('、')}
                                </div>
                                <div style={{ marginBottom: '2px' }}>
                                  <span style={{ fontWeight: 500 }}>費率：</span>
                                  {resource.chargingInfo.pricing}
                                </div>
                                <div style={{ marginBottom: '2px' }}>
                                  <span style={{ fontWeight: 500 }}>營運商：</span>
                                  {resource.chargingInfo.networkProvider}
                                </div>
                                <div>
                                  <span style={{ fontWeight: 500 }}>付款方式：</span>
                                  {resource.chargingInfo.paymentMethods.join('、')}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* 備註 */}
                          {resource.remarks && (
                            <div style={{ marginBottom: '12px' }}>
                              <div style={{ 
                                fontSize: '12px', 
                                fontWeight: 600, 
                                color: '#868e96', 
                                marginBottom: '4px'
                              }}>
                                💬 備註
                              </div>
                              <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.4' }}>
                                {resource.remarks}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 操作按鈕 */}
                        <div style={{ 
                          borderTop: '1px solid #dee2e6', 
                          paddingTop: '10px',
                          marginTop: '8px',
                          display: 'flex', 
                          justifyContent: 'center',
                          flexShrink: 0 // Prevent button area from shrinking
                        }}>
                          <button
                            style={{
                              backgroundColor: '#228be6',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              fontFamily: 'Noto Sans TC, sans-serif',
                              fontWeight: 500,
                              width: '100%',
                              maxWidth: '200px',
                            }}
                            onClick={() => {
                              const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${resource.latitude},${resource.longitude}`;
                              window.open(streetViewUrl, '_blank');
                            }}
                          >
                            🗺️ Google 街景
                          </button>
                        </div>
                      </div>
                    </Popup>
                  )}
                </Marker>
              ))}
              
            </MapContainer>
          </Box>
        </Box>
      )}

      {/* Batch Edit Modal */}
      <Modal
        opened={isBatchEditOpen}
        onClose={() => setIsBatchEditOpen(false)}
        title=""
        centered
        size={440}
        padding="16px"
        styles={{
          content: {
            background: '#ffffff',
            boxShadow: '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)',
            borderRadius: '4px',
            width: '440px',
          },
          header: {
            display: 'none',
          },
          body: {
            padding: '16px',
          },
        }}
      >
        <Stack gap="24px">
          <Box>
            <Title
              order={4}
              style={{
                color: '#000000',
                fontSize: '16px',
                fontFamily: 'Noto Sans TC',
                fontWeight: 700,
                lineHeight: '24px',
                margin: 0,
              }}
            >
              批次編輯備註
            </Title>
            <Text
              size="sm"
              c="dimmed"
              mt="4px"
            >
              已選擇 {selectedResources.length} 筆圖資
            </Text>
          </Box>

          <Stack gap="4px">
            <Text
              style={{
                color: '#000000',
                fontSize: '14px',
                fontFamily: 'Noto Sans TC',
                fontWeight: 500,
                lineHeight: '20px',
              }}
            >
              備註內容
            </Text>
            <Textarea
              placeholder="請輸入備註內容"
              value={batchRemarks}
              onChange={(event) => setBatchRemarks(event.currentTarget.value)}
              rows={4}
              styles={{
                input: {
                  backgroundColor: '#ffffff',
                  padding: '6px 12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'Noto Sans TC',
                  fontWeight: 400,
                  lineHeight: '20px',
                  '&::placeholder': {
                    color: '#adb5bd',
                  },
                },
              }}
            />
          </Stack>

          <Group justify="flex-end" gap="16px">
            <Button
              variant="outline"
              onClick={() => setIsBatchEditOpen(false)}
              styles={{
                root: {
                  backgroundColor: '#ffffff',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '6px 16px',
                  color: '#212529',
                  fontSize: '14px',
                  fontFamily: 'Noto Sans TC',
                  fontWeight: 400,
                  lineHeight: '20px',
                  '&:hover': {
                    backgroundColor: '#f8f9fa',
                  },
                },
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleBatchEdit}
              disabled={!batchRemarks.trim()}
              styles={{
                root: {
                  backgroundColor: '#228be6',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'Noto Sans TC',
                  fontWeight: 400,
                  lineHeight: '20px',
                  '&:hover': {
                    backgroundColor: '#1c7ed6',
                  },
                  '&:disabled': {
                    backgroundColor: '#e9ecef',
                    color: '#868e96',
                  },
                },
              }}
            >
              確認
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Service Detail Modal */}
      <Modal
        opened={isServiceDetailOpen}
        onClose={() => setIsServiceDetailOpen(false)}
        title=""
        centered
        size={600}
        padding="16px"
        styles={{
          content: {
            background: '#ffffff',
            boxShadow: '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)',
            borderRadius: '4px',
            width: '600px',
          },
          header: {
            display: 'none',
          },
          body: {
            padding: '16px',
          },
        }}
      >
        {selectedResource && (
          <Box>
            <div style={{ padding: '12px' }}>
              {/* 基本資訊 */}
              <div style={{ marginBottom: '16px' }}>
                <Text fw={600} mb="6px" style={{ fontSize: '18px', color: '#000' }}>
                  {selectedResource.placeName}
                </Text>
                <Text size="sm" mb="8px" style={{ color: '#666', lineHeight: '1.4' }}>
                  {selectedResource.address}
                </Text>
                <div style={{ marginBottom: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {selectedResource.serviceTypes.map((type: string) => (
                    <span
                      key={type}
                      style={{
                        backgroundColor: `rgba(${
                          type === '停車場' ? '76,110,245' : '18,184,134'
                        },0.1)`,
                        color: '#212529',
                        fontSize: '13px',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        border: 'none',
                        fontFamily: 'Noto Sans TC, sans-serif',
                      }}
                    >
                      {type}
                    </span>
                  ))}
                  <span
                    style={{
                      backgroundColor: `rgba(${
                        selectedResource.status === '營運中' ? '18,184,134' : 
                        selectedResource.status === '維護中' ? '250,176,5' : '250,82,82'
                      },0.1)`,
                      color: '#212529',
                      fontSize: '13px',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      border: 'none',
                      fontFamily: 'Noto Sans TC, sans-serif',
                    }}
                  >
                    {selectedResource.status}
                  </span>
                </div>
              </div>

              {/* 分隔線 */}
              <div style={{ 
                borderTop: '1px solid #dee2e6', 
                margin: '16px 0',
              }} />

              {/* 詳細資訊 */}
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {selectedResource.parkingInfo && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#4c6ef5', 
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      🅿️ 停車場資訊
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.5', marginLeft: '20px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500, minWidth: '80px', display: 'inline-block' }}>車位：</span>
                        {selectedResource.parkingInfo.availableSpaces}/{selectedResource.parkingInfo.totalSpaces} 可用
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500, minWidth: '80px', display: 'inline-block' }}>費率：</span>
                        {selectedResource.parkingInfo.hourlyRate}元/小時 (日最高{selectedResource.parkingInfo.maxDailyRate}元)
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500, minWidth: '80px', display: 'inline-block' }}>營業時間：</span>
                        {selectedResource.parkingInfo.operatingHours}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500, minWidth: '80px', display: 'inline-block' }}>車種：</span>
                        {selectedResource.parkingInfo.vehicleTypes.join('、')}
                      </div>
                      {selectedResource.parkingInfo.features && (
                        <div>
                          <span style={{ fontWeight: 500, minWidth: '80px', display: 'inline-block' }}>設施：</span>
                          {selectedResource.parkingInfo.features.join('、')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedResource.chargingInfo && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#12b886', 
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      ⚡ 充電站資訊
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.5', marginLeft: '20px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500, minWidth: '80px', display: 'inline-block' }}>充電樁：</span>
                        {selectedResource.chargingInfo.availableChargers}/{selectedResource.chargingInfo.totalChargers} 可用
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500, minWidth: '80px', display: 'inline-block' }}>類型：</span>
                        {selectedResource.chargingInfo.chargerTypes.join('、')}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500, minWidth: '80px', display: 'inline-block' }}>費率：</span>
                        {selectedResource.chargingInfo.pricing}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500, minWidth: '80px', display: 'inline-block' }}>營運商：</span>
                        {selectedResource.chargingInfo.networkProvider}
                      </div>
                      <div>
                        <span style={{ fontWeight: 500, minWidth: '80px', display: 'inline-block' }}>付款方式：</span>
                        {selectedResource.chargingInfo.paymentMethods.join('、')}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 備註 */}
                {selectedResource.remarks && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#868e96', 
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      💬 備註
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.5', marginLeft: '20px' }}>
                      {selectedResource.remarks}
                    </div>
                  </div>
                )}
              </div>

              {/* 操作按鈕 */}
              <div style={{ 
                borderTop: '1px solid #dee2e6', 
                paddingTop: '16px',
                display: 'flex', 
                gap: '12px',
                justifyContent: 'flex-end',
              }}>
                <button
                  style={{
                    backgroundColor: 'rgba(34,139,230,0.1)',
                    color: '#228be6',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontFamily: 'Noto Sans TC, sans-serif',
                  }}
                  onClick={() => {
                    const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${selectedResource.latitude},${selectedResource.longitude}`;
                    window.open(streetViewUrl, '_blank');
                  }}
                >
                  🗺️ Google 街景
                </button>
                <button
                  style={{
                    backgroundColor: '#228be6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontFamily: 'Noto Sans TC, sans-serif',
                  }}
                  onClick={() => setIsServiceDetailOpen(false)}
                >
                  關閉
                </button>
              </div>
            </div>
          </Box>
        )}
      </Modal>

      {/* Add Place Modal */}
      <Modal
        opened={isAddPlaceModalOpen}
        onClose={() => {
          setIsAddPlaceModalOpen(false);
          setNewPlaceForm({ placeName: '', address: '', streetViewUrl: '' });
        }}
        title=""
        centered
        size={500}
        padding="16px"
        styles={{
          content: {
            background: '#ffffff',
            boxShadow: '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)',
            borderRadius: '4px',
            width: '500px',
          },
          header: {
            display: 'none',
          },
          body: {
            padding: '16px',
          },
        }}
      >
        <Stack gap="24px">
          <Box>
            <Title
              order={4}
              style={{
                color: '#000000',
                fontSize: '16px',
                fontFamily: 'Noto Sans TC',
                fontWeight: 700,
                lineHeight: '24px',
                margin: 0,
              }}
            >
              新增圖資地點
            </Title>
            <Text
              size="sm"
              c="dimmed"
              mt="4px"
            >
              請填寫地點基本資訊，系統將自動從街景網址解析經緯度
            </Text>
          </Box>

          <Stack gap="16px">
            <Stack gap="4px">
              <Text
                style={{
                  color: '#000000',
                  fontSize: '14px',
                  fontFamily: 'Noto Sans TC',
                  fontWeight: 500,
                  lineHeight: '20px',
                }}
              >
                地點名稱 <span style={{ color: '#fa5252' }}>*</span>
              </Text>
              <TextInput
                placeholder="請輸入地點名稱"
                value={newPlaceForm.placeName}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setNewPlaceForm(prev => ({ ...prev, placeName: value }));
                }}
                styles={{
                  input: {
                    backgroundColor: '#ffffff',
                    padding: '6px 12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '20px',
                    '&::placeholder': {
                      color: '#adb5bd',
                    },
                  },
                }}
              />
            </Stack>

            <Stack gap="4px">
              <Text
                style={{
                  color: '#000000',
                  fontSize: '14px',
                  fontFamily: 'Noto Sans TC',
                  fontWeight: 500,
                  lineHeight: '20px',
                }}
              >
                地點地址 <span style={{ color: '#fa5252' }}>*</span>
              </Text>
              <TextInput
                placeholder="請輸入完整地址"
                value={newPlaceForm.address}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setNewPlaceForm(prev => ({ ...prev, address: value }));
                }}
                styles={{
                  input: {
                    backgroundColor: '#ffffff',
                    padding: '6px 12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '20px',
                    '&::placeholder': {
                      color: '#adb5bd',
                    },
                  },
                }}
              />
            </Stack>

            <Stack gap="4px">
              <Text
                style={{
                  color: '#000000',
                  fontSize: '14px',
                  fontFamily: 'Noto Sans TC',
                  fontWeight: 500,
                  lineHeight: '20px',
                }}
              >
                Google Map 街景網址 <span style={{ color: '#fa5252' }}>*</span>
              </Text>
              <TextInput
                placeholder="請輸入 Google 街景網址"
                value={newPlaceForm.streetViewUrl}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setNewPlaceForm(prev => ({ ...prev, streetViewUrl: value }));
                }}
                styles={{
                  input: {
                    backgroundColor: '#ffffff',
                    padding: '6px 12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '20px',
                    '&::placeholder': {
                      color: '#adb5bd',
                    },
                  },
                }}
              />
              <Text size="xs" c="dimmed">
                系統將自動解析經緯度座標
              </Text>
            </Stack>
          </Stack>

          <Group justify="flex-end" gap="16px">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddPlaceModalOpen(false);
                setNewPlaceForm({ placeName: '', address: '', streetViewUrl: '' });
              }}
              styles={{
                root: {
                  backgroundColor: '#ffffff',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '6px 16px',
                  color: '#212529',
                  fontSize: '14px',
                  fontFamily: 'Noto Sans TC',
                  fontWeight: 400,
                  lineHeight: '20px',
                  '&:hover': {
                    backgroundColor: '#f8f9fa',
                  },
                },
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleAddPlace}
              disabled={!newPlaceForm.placeName || !newPlaceForm.address || !newPlaceForm.streetViewUrl}
              styles={{
                root: {
                  backgroundColor: '#228be6',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'Noto Sans TC',
                  fontWeight: 400,
                  lineHeight: '20px',
                  '&:hover': {
                    backgroundColor: '#1c7ed6',
                  },
                  '&:disabled': {
                    backgroundColor: '#e9ecef',
                    color: '#868e96',
                  },
                },
              }}
            >
              建立地點
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  )
}