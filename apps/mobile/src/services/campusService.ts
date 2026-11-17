import { RoomItem, FloorInfo, CategoryFilter } from '../types';
import { CAMPUS_METADATA, FLOORS_CONFIG, ROOMS_DATA } from '../data/campusData';

export const CampusService = {
  getCampusMetadata() {
    return CAMPUS_METADATA;
  },

  getAllFloors(): FloorInfo[] {
    return FLOORS_CONFIG;
  },

  getFloorByLevel(level: string): FloorInfo | undefined {
    return FLOORS_CONFIG.find((f) => f.level.toUpperCase() === level.toUpperCase());
  },

  getAllRooms(): RoomItem[] {
    return ROOMS_DATA;
  },

  getRoomById(id: string): RoomItem | undefined {
    return ROOMS_DATA.find((r) => r.id === id);
  },

  getRoomsByFloor(floorLevel: string): RoomItem[] {
    return ROOMS_DATA.filter((r) => r.floorLevel === floorLevel);
  },

  getRoomsByCategory(category: CategoryFilter): RoomItem[] {
    if (category === 'All') return ROOMS_DATA;
    return ROOMS_DATA.filter((r) => r.category === category);
  },

  searchLocations(query: string, category: CategoryFilter = 'All'): RoomItem[] {
    const cleanQuery = query.trim().toLowerCase();
    
    let baseList = ROOMS_DATA;
    if (category !== 'All') {
      baseList = baseList.filter((r) => r.category === category);
    }

    if (!cleanQuery) {
      return baseList;
    }

    return baseList.filter((room) => {
      const matchRoomNum = room.roomNumber.toLowerCase().includes(cleanQuery);
      const matchName = room.name.toLowerCase().includes(cleanQuery);
      const matchType = room.type.toLowerCase().includes(cleanQuery);
      const matchDept = room.department ? room.department.toLowerCase().includes(cleanQuery) : false;
      const matchLandmark = room.nearbyLandmarks.some((lm) => lm.toLowerCase().includes(cleanQuery));
      return matchRoomNum || matchName || matchType || matchDept || matchLandmark;
    });
  },

  getPopularDestinations(): RoomItem[] {
    const popularIds = ['AB_608', 'AB_6_PHYSICS_LAB_WEST', 'AB_6_BOARD_ROOM', 'AB_7_APEX_LIB', 'AB_2_ADMISSION'];
    return ROOMS_DATA.filter((r) => popularIds.includes(r.id));
  },

  getNearbyFacilities(): RoomItem[] {
    const facilityIds = ['AB_6_BOARD_ROOM', 'AB_7_APEX_LIB', 'AB_2_ADMISSION', 'AB_2_EVAL_CTR'];
    return ROOMS_DATA.filter((r) => facilityIds.includes(r.id));
  },
};
