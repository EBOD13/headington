import pymongo
from pymongo import MongoClient
import json
from datetime import datetime

class Database:
    def __init__(self):
        self.cluster = MongoClient("")
        self.db = self.cluster['headingtonVisit']
        self.res_collection = self.db['residents']
        self.visitation_collection = self.db['visitation_log']

    # The following function will allow a search using the resident's room or assigned ID
    def getResident(self, roomToFind):
        countRoomResult = self.res_collection.count_documents({"room": roomToFind})
        residentData = []
        if countRoomResult > 0:
            residentsInRoom = self.res_collection.find({"room": roomToFind})
            for resident in residentsInRoom:
                residentData.append(list(resident.values()))
            return residentData
        else:
            return False

    def getCheckedInVisitors(self, roomToFind):
        countRoomResult = self.visitation_collection.count_documents({"res_room": roomToFind, "checkout_time": ""})
        visitorsData = []
        if countRoomResult > 0:
            checkedInVisitors = self.visitation_collection.find({"res_room": roomToFind, "checkout_time": ""})
            for visitor in checkedInVisitors:
                visInfo = visitor['vis_fullname'] + " " + visitor['vis_cont']
                visitorsData.append(visInfo)
            return visitorsData
        else:
            return False

    def checkInVisitor(self, checkinDate, resFullName, visFullName, resRoom, visCont, checkinTime, checkoutTime=""):
        visitationData = {
            "checkin_date": checkinDate,
            "res_fullname": resFullName,
            "vis_fullname": visFullName,
            "res_room": resRoom,
            "vis_cont": visCont,
            "checkin_time": checkinTime,
            "checkout_time": checkoutTime
        }

        self.visitation_collection.insert_one(visitationData)

    def is_checked_in(self, vis_full_name, room_to_find):
        count_room_result = self.visitation_collection.count_documents({"res_room": room_to_find})
        checked_in_visit = self.visitation_collection.count_documents({"vis_fullname": vis_full_name.lower()})

        if count_room_result > 0 and checked_in_visit > 0:
            checked_in_visitor = self.visitation_collection.find_one({
                "vis_fullname": vis_full_name.lower(),
                "res_room": room_to_find,
                "checkout_time": ""
            })

            if checked_in_visitor:
                return "VI"  # Visitor is checked in
            else:
                return "VO"  # Visitor is not checked in or has checked out
        else:
            return "NV"  # Room not found or visitor not in the collection

    def checkOutVisitor(self, vis_full_name, room_to_find):
        status = self.is_checked_in(vis_full_name, room_to_find)

        if status == "VI":
            check_out_time = datetime.now().strftime('%H:%M')
            self.visitation_collection.find_one_and_update(
                {
                    "vis_fullname": vis_full_name.lower(),
                    "res_room": room_to_find,
                    "checkout_time": ""
                },
                {"$set": {"checkout_time": check_out_time}}
            )
            return True  # Successfully checked out
        elif status == "VO":
            # Visitor is not checked in or has checked out
            return False  # Visitor is not checked in
        else:
            # Room not found or visitor not in the collection
            return False  # Room not found or visitor not in the collection


    def addNewResident(self, resID, resFirstName, resLastName, resRoom, resEmail):
        status = self.res_collection.count_documents({"_id":resID, "firstName": resFirstName,"lastName": resLastName, "room": resRoom})
        residentData = {
                "_id": resID,
                "firstName": resFirstName,
                "lastName": resLastName,
                "room": resRoom,
                "email": resEmail,
                "visitors": []
        }
        if status > 0:
            return True
        else:
            self.res_collection.insert_one(residentData)
            return False

    def getAllRooms(self, side):
        listOfRooms = []
        rooms = self.res_collection.find({"room": {"$regex": side}})
        for room in rooms:
            listOfRooms.append(room["room"][1:])
        return list(set(listOfRooms))


    def addNewVisitor(self, resFirstName, resLastName, resRoom, visFullName, visCont):
        resID = resFirstName[0] + resLastName[0:3] + resRoom[1:]

        query = {
            "firstName": resFirstName.strip(),
            "lastName": resLastName.strip(),
            "room": resRoom.strip(),
            "visitors": {"$elemMatch": {"vis_fullname": visFullName.strip()}}
        }

        resident = self.res_collection.find_one(query)

        if resident is None:
            filter_query = {
                "firstName": resFirstName.strip(),
                "lastName": resLastName.strip(),
                "room": resRoom.strip()
            }
            self.addNewResident(resID.strip(), resFirstName.strip(), resLastName.strip(), resRoom.strip())
            # Document found, update the collection by adding a new visitor
            update_query = {
                "$push": {
                    "visitors": {
                        "vis_fullname": visFullName.strip(),
                        "vis_cont": visCont.strip()
                    }
                }
            }

            self.res_collection.update_one(filter_query, update_query)
        else:
            # Document found, visitor already exists
            return True