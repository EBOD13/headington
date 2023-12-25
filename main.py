import json
import os, pathlib, google.auth.transport.requests
from flask import Flask, render_template, request, redirect, url_for, session, abort, jsonify, flash
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from pip._vendor import cachecontrol
import google.auth.transport.requests
import requests
import pyrebase
from HeadingtonDB import Database
from datetime import datetime
from pprint import pprint

db = Database()
app = Flask("Visit")
app.secret_key = 'fc41fa515e37ff0c99d6e7ca'

@app.route("/")
@app.route("/about")
def main():
    return render_template("/about.html")

@app.route("/checkin")
def checkin():
    return render_template("/checkin.html")

@app.route('/side_process_reg', methods=['POST'])
@app.route('/side_process_out', methods=['POST'])
@app.route('/side_process_in', methods=['POST'])
def sideProcess():
    data = request.get_json()
    side_result = data['side'].lower()

    if side_result == 'south':
        rooms = db.getAllRooms('s')
    elif side_result == 'north':
        rooms = db.getAllRooms('n')
    else:
        rooms = []

    return jsonify(result=rooms)

# @app.route('/side_process_out', methods=['POST'])
# def sideProcessOut():
#     data = request.get_json()
#     side_result = data['side'].lower()
#
#     if side_result == 'south':
#         rooms = db.getAllRooms('s')
#     elif side_result == 'north':
#         rooms = db.getAllRooms('n')
#     else:
#         rooms = []
#
#     return jsonify(result=rooms)

@app.route('/combinedProcess', methods=['POST'])
def combinedProcess():
    data = request.get_json()
    listOfResident = []
    if data['type'] == 'combinedSelection':
        sideAndRoom = data['combined']
        # Check whether or not we have some kind of result
        result = db.getResident(str(sideAndRoom))
        if (result):
            listOfResident = result
        else:
            listOfResident
            
    return jsonify(residentNames=listOfResident)  # Return appropriate response

@app.route("/update_visitor", methods=['POST'])
def updateVisitor():
    data = request.get_json()
    listOfVisitor = []
    if data['type'] == 'sideAndRoom':
        sideAndRoom = data['sideAndRoom']
        # Check whether or not we have some kind of result
        result = db.getCheckedInVisitors(str(sideAndRoom))
        if (result):
            listOfVisitor = result
        else:
            listOfVisitor = []
    return jsonify(visitors=listOfVisitor)

@app.route('/res_registration_data', methods =["GET", "POST"])
def res_registration_data():
    if request.method == "POST":
        regData = request.form
        res_id = regData['resFirstName'][0].lower().strip() + regData['resLastName'][0:3].lower().strip() + regData['roomNumber'].strip()
        res_firstname = regData['resFirstName'].lower().strip()
        res_lastname = regData['resLastName'].lower().strip()
        res_room = regData['side'][0] + "" + regData['roomNumber']
        res_cont = regData['resContact']
        db.addNewResident(res_id, res_firstname, res_lastname, res_room, res_cont)
        return render_template("/about.html")
    return render_template("/resident_registration.html")

@app.route("/checkout_data", methods=['POST', 'GET'])
def checkout_data():
    if request.method == "POST":
        data = request.form
        res_room = data['side'][0] + "" + data['roomNumber'].strip()
        vis_fullname = data['visList'].strip()
        db.checkOutVisitor(vis_fullname, res_room)
        return render_template("/about.html")  # Return a success response or render a template
    return render_template("/checkout.html")

@app.route('/checkin_data', methods=['POST', 'GET'])
def checkin_data():
    if request.method == "POST":
        data = request.form
        resList = json.loads(data['resList'])
        resident_fullname = resList[1] + " " + resList[2]
        checkin_time = datetime.now().strftime('%H:%M')
        checkin_date = datetime.today().strftime('%m/%d/%y')
        vis_fullname = data['visList'].split(" ")[0].lower() + " " + data['visList'].split(" ")[1].lower()
        vis_cont = ""
        res_room = data['side'][0] + "" + data['roomNumber']
        verification = db.is_checked_in(vis_fullname, res_room)

        if verification == "VO":
            return render_template("/about.html")
        elif verification == "VI":
            flash("Visitor already checked-in. Please check-out first.")
            return render_template("/checkin.html")
        elif verification == "NV":
            db.checkInVisitor(checkin_date, resident_fullname, vis_fullname, res_room, vis_cont, checkin_time)
            return render_template("/about.html")
    return render_template("/checkin.html")

@app.route("/vis_registration_data", methods=['POST', 'GET'])
def vis_registration_data():
    if request.method == "POST":
        regData = request.form
        if 'resList' in regData:
            resList = json.loads(regData['resList'])
            res_firstname = resList[1].lower().strip()
            res_lastname = resList[2].lower().strip()
            room = regData['side'][0] + regData['roomNumber']
            vis_fullname = regData['visFirstName'].lower().strip() + " " + regData['visLastName'].lower().strip()
            vis_contact = regData['visContact']
            db.addNewVisitor(res_firstname, res_lastname, room, vis_fullname, vis_contact)

        else:
            res_firstname = regData['resFirstName'].lower()
            res_lastname = regData['resLastName'].lower()
            room = regData['side'][0] + regData['roomNumber'].lower()
            vis_fullname = regData['visFirstName'].lower() + " " + regData['visLastName'].lower()
            vis_contact = regData['visContact']
            db.addNewVisitor(res_firstname, res_lastname, room, vis_fullname, vis_contact)


        return render_template("/about.html")  # For example, redirect to the homepage
    return render_template("/visitor_registration.html")


@app.route("/resident_registration")
def resident_registration():
    return render_template("/resident_registration.html")

@app.route("/visitor_registration")
def visitor_registration():
    return render_template("/visitor_registration.html")



if __name__ == "__main__":
    app.run(debug=True)