import { FormControlLabel, Switch } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { Form } from "react-bootstrap";
import DataGrid, { Scrolling, Paging, Column } from 'devextreme-react/data-grid';
import { GetAccountList, GetCalendarGroup, GetCartAgencyCourseSchedulerList, GetCartAgencyCoursesList, GetCertAgencyList, GetClassContactsByAddressAndCert, GetClassStatus, GetRfiData, GetSitesAddressList, GetSitesList } from "../../../helper/BasicFn";
import Select from 'react-select'
import MessageHandler from '../../../components/common/MessageHandler';
import { CallGETAPINEW, CallPOSTAPI, CallPOSTAPINEW } from '../../../helper/API';
import Sessions from '../../../components/modals/sessions';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import InstructorModal from '../../../components/modals/InstructorModal';
import { FormatDate, addDollarSign, prepareOptions } from '../../../helper/Common';
import SubHeadingOther from '../../../components/header/SubHeadingOther';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import AedComponent from '../../../components/modals/AED/AedComponent';
import TrainingAddressModal from '../../../components/modals/trainingAddressModal/TrainingAddressModal';
import { AccRepsDropDown, AssignContectRepList, ContactList, ContectRepList, ModalAccReps } from "../../../helper/BasicFn";
import ContactModel from '../../../components/modals/ContactModel';
import InpersonContactModel from '../../../components/modals/InpersonContactModel/InpersonContactModel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CommonDatePicker from '../../../components/common/date-picker/CommonDatePicker';
import Loading from "../../accounts/Loading";

export default function EditInperson() {
	const navigate = useNavigate();
	const location = useLocation();
	const [loading, setLoading] = useState(true)
	const [allAccounts, setAccounts] = useState([]);
	const [allSites, setSites] = useState([]);
	const [allAddress, setAddress] = useState([]);
	const [allCertAgency, setCertAgency] = useState([]);
	const [allCourses, setCourses] = useState([]);
	const [allScheduler, setScheduler] = useState([]);
	const [allClassStatus, setClassStatus] = useState([]);
	const [allColorGroup, setColorGroup] = useState([]);
	const [formData, setFormData] = useState({});
	const [FormMsg, setFormMsg] = useState({ type: true, msg: "" });
	const [validated, setValidated] = useState(false);
	const [addressModal, setAddressModal] = useState(false);
	const [selectChangeData, setSelectChangeData] = useState({});
	const [aedData, setAedData] = useState([]);
	const [contactShowModel, setContactShowModel] = useState(false);
	const [contactRepsList, setContactRepsList] = useState([]);
	const [SelectContact, setSelectContact] = useState([])
	const [classContacts, setClassContacts] = useState({});
	const [classes, setClasses] = useState([]);
	const [validatedField, setValidatedField] = useState({});
	const [courseTime, setCourseTime] = useState("")
	const [registrationTime, setRegistrationTime] = useState("")
	const { accountId } = useParams();
	const { inpersonId } = useParams();

	// handleClassInputChange
	const handleClassInputChange = (e, index, optionNumber) => {
		const key = e.target.name

		const indexRow = classes[index];

		if (e.target.checked) {
			indexRow[key] = optionNumber
		} else {
			indexRow[key] = 0
		}

		let isPrimary = indexRow[key]

		setClasses(classes.map(l => l.id == index + 1 ? { ...l, [key]: isPrimary } : l));
	}

	// fetch all on laod data 
	const fetchOnLoad = async () => {
		// fetch accounts
		let accounts = await GetAccountList()

		if (accounts.status) {
			let accountsData = accounts?.data?.data?.account
			let allAccountsData = prepareOptions(accountsData, "account_id", "account_name");
			setAccounts(allAccountsData)
		}

		// fetch cart agency
		let cert = await GetCertAgencyList()

		if (cert.status) {
			let CertAgencyData = cert?.data?.agenciesList
			let allCertAgencyData = prepareOptions(CertAgencyData, "certifying_agency_id", "certifying_agency_name");
			setCertAgency(allCertAgencyData)
		}

		// scheduler
		let scheduler = await GetCartAgencyCourseSchedulerList()

		if (scheduler.status) {
			let schedulerListData = scheduler?.data?.schedulerList
			let allschedulerListData = prepareOptions(schedulerListData, "course_id", "course_name");
			setScheduler(allschedulerListData)
		}

		// classStatus
		let classStatus = await GetClassStatus()

		if (classStatus.status) {
			let classStatusData = classStatus?.data?.statusList
			let allclassStatusData = prepareOptions(classStatusData, "class_status_id", "class_status_type");
			setClassStatus(allclassStatusData)
		}

		// calendar group
		let calendarGroup = await GetCalendarGroup()

		if (calendarGroup.status) {
			let calendarGroupData = calendarGroup?.data?.calendarGroup
			let allcalendarGroupData = prepareOptions(calendarGroupData, "calendar_group_id", "calendar_group_name");
			setColorGroup(allcalendarGroupData)
		}

		let AccountContactList = await ContactList(accountId)

		if (AccountContactList) {
			setContactRepsList(AccountContactList)
		}

	}

	// fetch sites
	const fetchSites = async (accountId) => {
		let sites = await GetSitesList(accountId)

		if (sites.status) {
			let sitesData = sites?.data?.data?.site_details
			let allSitesData = prepareOptions(sitesData, "account_site_info_id", "account_site_name");
			setSites(allSitesData)
			setSelectChangeData((old) => ({ ...old, ['site_id']: "" }));
			setSelectChangeData((old) => ({ ...old, ['training_address_id']: "" }));
		}
	}

	// fetch sites
	const fetchSiteAddress = async (siteId) => {
		let sitesAddress = await GetSitesAddressList(siteId)
		if (sitesAddress.status) {
			let sitesAddressDetails = sitesAddress?.data?.siteAddress;
			let sitesAddressData = sitesAddress?.data?.trainingLocations || []

			sitesAddressData?.map((data, index) => {
				let address = ''
				address += data?.account_alternate_traning_location_address1 ? data?.account_alternate_traning_location_address1 + ' ' : '';
				address += data?.account_alternate_traning_location_address2 ? data?.account_alternate_traning_location_address2 + ' ' : '';
				address += data?.account_alternate_traning_location_city ? data?.account_alternate_traning_location_city + ' ' : '';
				address += data?.state_name ? data?.state_name + ' ' : '';
				address += data?.country_name ? data?.country_name + ' ' : '';
				address += data?.account_alternate_traning_location_zipcode ? data?.account_alternate_traning_location_zipcode + ' ' : '';
				data.addressData = address
			})

			let allSitesAddressData = prepareOptions(sitesAddressData, "account_alternate_traning_location_id", "addressData");
			let filteredSite = [{
				value: siteId,
				label: sitesAddressDetails?.account_site_address1 + ' ' + sitesAddressDetails?.account_site_address2 + ' ' + sitesAddressDetails?.account_site_city + ' ' + sitesAddressDetails?.account_site_zipcode,
			}];

			setAddress([...filteredSite, ...allSitesAddressData]);
			setSelectChangeData((old) => ({ ...old, ['training_address_id']: "" }));
		}
	}

	// FETCH CART COURSES
	const fetchCartCourses = async (cartId) => {
		let courses = await GetCartAgencyCoursesList(cartId)

		if (courses.status) {
			let courseListData = courses?.data?.courseList
			let allcourseListData = prepareOptions(courseListData, "course_id", "course_name");
			setCourses(allcourseListData)
		}
	}

	// pass input field value to formdata
	const handleInputChange = (e) => {
		if (e.target.name == 'student_price' || e.target.name == 'parking_fee') {
			e.target.value = addDollarSign(e.target.value);
		}

		if (e.target.type == 'checkbox') {
			setFormData((old) => ({ ...old, [e.target.name]: e.target.checked }));
		} else {
			setFormData((old) => ({ ...old, [e.target.name]: e.target.value }));
		}
	};

	// handle address change
	const handleSelectChange = async (data, key) => {
		if (key == 'course') {
			let courses = await GetCartAgencyCoursesList(formData?.cert_agency)

			if (courses.status) {
				let courseListData = courses?.data?.courseList
				const filteredCourse = courseListData.find(
					(course) => course.course_id == data.value
				)

				setFormData((old) => ({ ...old, 'course_length': filteredCourse?.course_length }));
			}

		}

		if (key == 'training_address_id') {
			if (data?.value == formData?.site_id) {
				setFormData((old) => ({ ...old, ['is_site_address']: 1 }));
			} else {
				setFormData((old) => ({ ...old, ['is_site_address']: 0 }));
			}
		}

		setFormData((old) => ({ ...old, [key]: data.value }));
		setSelectChangeData((old) => ({ ...old, [key]: data }));
		setValidatedField((old) => ({ ...old, [key]: false }));
	};

	// handle calendar change
	const handleCalendarChange = (value, key) => {
		let date = value?.$D;
		date = date < 10 ? '0' + date : date;
		let month = value?.$M;
		month = parseInt(month + 1);
		month = month < 10 ? '0' + month : month;
		let year = value?.$y;

		let dateValue = year + '-' + month + '-' + date;

		setFormData((old) => ({ ...old, [key]: dateValue }));
		setValidatedField((old) => ({ ...old, [key]: false }));
	};

	// handle Time change
	const handleTimeChange = (value, key) => {
		let hour = value?.$H;
		hour = hour < 10 ? '0' + hour : hour;
		let min = value?.$m;
		min = min < 10 ? '0' + min : min;
		let sec = value?.$s;
		sec = sec < 10 ? '0' + sec : sec;

		let timeValue = hour + ':' + min + ':' + sec;

		setFormData((old) => ({ ...old, [key]: value }));
		setFormData((old) => ({ ...old, [key + '_formated']: timeValue }));
		setValidatedField((old) => ({ ...old, [key]: false }));
		setCourseTime(value);
	};

	const handleRegistrationTimeChange = (value, key) => {
		{
			let hour = value?.$H;
			hour = hour < 10 ? '0' + hour : hour;
			let min = value?.$m;
			min = min < 10 ? '0' + min : min;
			let sec = value?.$s;
			sec = sec < 10 ? '0' + sec : sec;

			let timeValue = hour + ':' + min + ':' + sec;

			setFormData((old) => ({ ...old, [key]: value }));
			setFormData((old) => ({ ...old, [key + '_formated']: timeValue }));
			setValidatedField((old) => ({ ...old, [key]: false }));
			setRegistrationTime(value);
		}
	}

	const stopDateTimeChange = (e) => {
		e.preventDefault();
	};

	// function to submit form data
	const handleSubmit = async (e) => {
		e.preventDefault();

		const validationsFields = ['site_id', 'training_address_id', 'cert_agency', 'course', 'course_date', 'course_time'];
		validationsFields.map((field) => {
			let value = formData[field];
			if (value == undefined || value == '' || value == null) {
				setValidatedField((old) => ({ ...old, [field]: true }));
				setValidated(true);
			} else {
				setValidatedField((old) => ({ ...old, [field]: false }));
				setValidated(false);
			}
		})

		const form = e.currentTarget;

		if (form.checkValidity() === false) {
			setValidated(true);
			window.scrollTo(0, 0);
			return;
		}

		saveForm();

	}

	// save form
	const saveForm = async () => {
		let allClassContacts = [];
		if (classContacts && classContacts.length > 0) {
			allClassContacts.push(classContacts);
		}

		let payloadData = {
			"class_id": inpersonId,
			"rfi": formData?.rfi,
			"account_id": accountId,
			"site_id": formData?.site_id,
			"training_address_id": formData?.training_address_id,
			"room_name": formData?.room_name,
			"room_number": formData?.room_number,
			"cert_agency": formData?.cert_agency,
			"course": formData?.course,
			"public": formData?.public ? 1 : 0,
			"skills_check": formData?.skills_check ? 1 : 0,
			"keycodes": formData?.keycodes_applied ? 1 : 0,
			"package": formData?.package ? 1 : 0,
			"expected": formData?.expected_students,
			"minimum": formData?.min_student,
			"miximum": formData?.max_student,
			"student_price": formData?.student_price?.length > 1 ? formData?.student_price.replace('$', '') : '',
			"course_date": formData?.course_date,
			"course_time": formData?.course_time,
			"registration_close_date": formData?.registration_close_date,
			"registration_close_time": formData?.registration_close_time,
			"instructors_needed": formData?.instructors_needed,
			"hours": formData?.course_length,
			"parking_fee": formData?.parking_fee?.length > 1 ? formData?.parking_fee.replace('$', '') : '',
			"loading_doc": formData?.loading_dock ? 1 : 0,
			"onsite_parking": formData?.onsite_parking ? 1 : 0,
			"special_parking_instruction": formData?.special_parking_instructions,
			"security_procedure": formData?.security_procedures,
			"tv_projector": formData?.tv_projector ? 1 : 0,
			"dvd_computer": formData?.dvd_computer ? 1 : 0,
			"speaker_system": formData?.speaker_system,
			"aed_information": aedData,
			"class_contacts": allClassContacts, //classContacts?.length > 0 ? [ classContacts ] : [],
			"masks_required": formData?.covid_restrictions_required ? 1 : 0,
			"special_requirements": formData?.covid_special_requirement_for_instructor,
			"comments": formData?.comments,
			"color_group": formData?.color_group,
			"status": formData?.status,
			"paid": formData?.paid ? 1 : 0,
			"is_site_address": formData?.is_site_address ? 1 : 0,
			"invoice_number": formData?.invoice_number,
			"keycodes_sent": formData?.keycodes_sent ? 1 : 0,
			"package_tracking": formData?.package_tracking,
			"classes": classes,
		}

		// call the post api function
		let result = await CallPOSTAPINEW("account/update-inperson-class", payloadData)
		setFormMsg({ type: result?.data?.status, msg: result?.data?.message });

		if (result?.status) {
			navigate('/account/inperson/details/' + inpersonId);
		}
	}

	// calendar icon
	const calendarIcon = () => {
		return (
			<img src="/calendar.svg" alt="calendar" />
		)
	}

	// time icon
	const timeIcon = () => {
		return (
			<img src="/icon-time.png" alt="time-icon" />
		)
	}

	// filter account
	const filterAccount = async (accountId) => {
		let accounts = await GetAccountList()
		if (accounts.status) {
			let accountsData = accounts?.data?.data?.account
			let allAccountsData = prepareOptions(accountsData, "account_id", "account_name");
			const filteredAccount = allAccountsData.find(
				(account) => account.value == accountId
			)

			return filteredAccount;
		}
	}

	// filter site
	const filterSite = async (accountId, siteId) => {
		let sites = await GetSitesList(accountId)

		if (sites.status) {
			let sitesData = sites?.data?.data?.site_details
			let allSitesData = prepareOptions(sitesData, "account_site_info_id", "account_site_name");
			setSites(allSitesData)
			const filteredSite = allSitesData.find(
				(site) => site.value == siteId
			)

			return filteredSite;
		}
	}

	// filter site
	const filterTrainingAddress = async (siteId, trainingId) => {
		let sitesAddress = await GetSitesAddressList(siteId)
		if (sitesAddress.status) {
			let sitesAddressData = sitesAddress?.data?.trainingLocations || []

			sitesAddressData.map((data, index) => {
				data.addressData = data?.account_alternate_traning_location_address1 + ' ' + data?.account_alternate_traning_location_address2 + ' ' + data?.account_alternate_traning_location_city + ' ' + data?.state_name + ' ' + data?.country_name + ' ' + data?.account_alternate_traning_location_zipcode
			})

			let allSitesAddressData = prepareOptions(sitesAddressData, "account_alternate_traning_location_id", "addressData");
			setAddress(allSitesAddressData)

			const filteredSiteAddress = allSitesAddressData.find(
				(address) => address.value == trainingId
			)

			return filteredSiteAddress;
		}

	}

	// filter site
	const filterCertAgency = async (certId) => {

		// fetch cart agency
		let cert = await GetCertAgencyList()

		if (cert.status) {
			let CertAgencyData = cert?.data?.agenciesList
			let allCertAgencyData = prepareOptions(CertAgencyData, "certifying_agency_id", "certifying_agency_name");
			setCertAgency(allCertAgencyData)

			const filteredCertAgency = allCertAgencyData.find(
				(address) => address.value == certId
			)
			return filteredCertAgency;
		}

	}

	// filter site
	const filterCourse = async (certIdId, courseId) => {
		let courses = await GetCartAgencyCoursesList(certIdId)

		if (courses.status) {
			let courseListData = courses?.data?.courseList
			let allcourseListData = prepareOptions(courseListData, "course_id", "course_name");
			setCourses(allcourseListData)

			const filteredCourse = allcourseListData.find(
				(course) => course.value == courseId
			)

			return filteredCourse;
		}

	}

	// filter CalendarGroup
	const filterCalendarGroup = async (calendarId) => {
		let calendarGroup = await GetCalendarGroup()

		if (calendarGroup.status) {
			let calendarGroupData = calendarGroup?.data?.calendarGroup
			let allcalendarGroupData = prepareOptions(calendarGroupData, "calendar_group_id", "calendar_group_name");
			const filteredcalendarGroup = allcalendarGroupData.find(
				(calendarGroup) => calendarGroup.value == calendarId
			)

			return filteredcalendarGroup;
		}

	}

	// filter CalendarGroup
	const filterClassStatus = async (statusId) => {
		let ClassStatus = await GetClassStatus()

		if (ClassStatus.status) {
			let ClassStatusData = ClassStatus?.data?.statusList
			let allClassStatusData = prepareOptions(ClassStatusData, "class_status_id", "class_status_type");
			const filteredClassStatus = allClassStatusData.find(
				(ClassStatus) => ClassStatus.value == statusId
			)

			return filteredClassStatus;
		}

	}

	// get class conatcts
	const getClassContacts = async (addressId, certId) => {
		const result = await GetClassContactsByAddressAndCert(addressId, certId)

		if (result?.status) {
			const classContacts = result?.data?.data
		}
	}


	const fetchcourseTime = async () => {
		// Make an API request to fetch inperson.course_time
		const inpersonData = await CallGETAPINEW('account/inperson-class/' + inpersonId)

		const inperson = inpersonData?.data?.data?.inpersonClass;
		const fetchedCourseTime = inperson?.course_time;

		// const timeString = inperson?.course_time;
		// const [hours, minutes] = timeString.split(':');
		// const date = new Date();
		// date.setHours(parseInt(hours), parseInt(minutes));
		// setCourseTime(date)

		// const timeString1 = inperson?.registration_close_time;
		// const [hours1, minutes1] = timeString1.split(':');
		// const date1 = new Date();
		// date1.setHours(parseInt(hours1), parseInt(minutes1));
		// setRegistrationTime(date1)
	};

	// get inperson data
	const getInpersonData = async () => {
		const inpersonData = await CallGETAPINEW('account/inperson-class/' + inpersonId)

		if (inpersonData?.status) {
			const inperson = inpersonData?.data?.data?.inpersonClass

			inperson.course_length = inperson?.hours
			inperson.loading_dock = inperson?.loading_doc
			inperson.keycodes_applied = inperson?.keycodes
			inperson.package = inperson?.package
			inperson.special_parking_instructions = inperson?.special_parking_instruction
			inperson.security_procedures = inperson?.security_procedure
			inperson.training_address_information_primary = inperson?.class_contacts[0]?.training_site_cordinator?.primary_id
			inperson.training_address_information_primary_name = inperson?.class_contacts[0]?.training_site_cordinator?.primary_name
			inperson.instructor_contact_primary = inperson?.class_contacts[0]?.instructor_contact?.primary_id
			inperson.instructor_contact_primary_name = inperson?.class_contacts[0]?.instructor_contact?.primary_name
			inperson.billing_contact_primary = inperson?.class_contacts[0]?.billing_contact?.primary_id
			inperson.billing_contact_primary_name = inperson?.class_contacts[0]?.billing_contact?.primary_name

			inperson.training_address_information_backup = inperson?.class_contacts[0]?.training_site_cordinator?.backup_id
			inperson.training_address_information_backup_name = inperson?.class_contacts[0]?.training_site_cordinator?.backup_name
			inperson.instructor_contact_backup = inperson?.class_contacts[0]?.instructor_contact?.backup_id
			inperson.instructor_contact_backup_name = inperson?.class_contacts[0]?.instructor_contact?.backup_name
			inperson.billing_contact_backup = inperson?.class_contacts[0]?.billing_contact?.backup_id
			inperson.billing_contact_backup_name = inperson?.class_contacts[0]?.billing_contact?.backup_name

			inperson.covid_restrictions_required = inperson?.masks_required
			inperson.covid_special_requirement_for_instructor = inperson?.special_requirements
			inperson.min_student = inperson?.minimum
			inperson.max_student = inperson?.miximum
			inperson.expected_students = inperson?.expected

			if (inperson?.parking_fee != undefined && inperson?.parking_fee != null) {
				inperson.parking_fee = '$' + inperson?.parking_fee ?? 0
			}

			if (inperson?.student_price != undefined && inperson?.student_price != null) {
				inperson.student_price = '$' + inperson?.student_price ?? 0
			}

			inperson.aed_information = JSON.parse(inperson?.aed_information);
			inperson.class_contacts = JSON.parse(inperson?.class_contacts);
			inperson.classes = JSON.parse(inperson?.classes);

			setFormData(inperson)
			setClasses(inperson?.classes)

			const filteredSite = await filterSite(inperson?.account_id, inperson?.site_id)
			setSelectChangeData((old) => ({ ...old, 'site_id': filteredSite }))

			if (inperson?.training_address_id != null && inperson?.training_address_id != '' && inperson?.training_address_id != undefined) {
				const filteredTrainingAddress = await filterTrainingAddress(inperson?.site_id, inperson?.training_address_id)
				setSelectChangeData((old) => ({ ...old, 'training_address_id': filteredTrainingAddress }))
				setFormData((old) => ({ ...old, 'training_address_id': filteredTrainingAddress?.value }))
			}

			if (inperson?.cert_agency != null && inperson?.cert_agency != '' && inperson?.cert_agency != undefined) {
				const filteredCertAgency = await filterCertAgency(inperson?.cert_agency)
				setSelectChangeData((old) => ({ ...old, 'cert_agency': filteredCertAgency }))
				setFormData((old) => ({ ...old, 'cert_agency': filteredCertAgency?.value }))
			}

			if (inperson?.course != null && inperson?.course != '' && inperson?.course != undefined) {
				const filteredCourse = await filterCourse(inperson?.cert_agency, inperson?.course)
				setSelectChangeData((old) => ({ ...old, 'course': filteredCourse }))
				setFormData((old) => ({ ...old, 'course': filteredCourse?.value }))
			}

			if (inperson?.cert_agency != null && inperson?.cert_agency != '' && inperson?.cert_agency != undefined && inperson?.training_address_id != null && inperson?.training_address_id != '' && inperson?.training_address_id != undefined) {
				getClassContacts(inperson?.training_address_id, inperson?.cert_agency);
			}

			if (inperson?.color_group != null && inperson?.color_group != '' && inperson?.color_group != undefined) {
				const filteredColorGroup = await filterCalendarGroup(inperson?.color_group)
				setSelectChangeData((old) => ({ ...old, 'color_group': filteredColorGroup }))
			}

			if (inperson?.status != null && inperson?.status != '' && inperson?.status != undefined) {
				const filteredStatus = await filterClassStatus(inperson?.status)
				setSelectChangeData((old) => ({ ...old, 'status': filteredStatus }))
			}

			if (inperson?.aed_information) {
				setAedData(inperson?.aed_information)
			}

			setClassContacts(inperson?.class_contacts[0])

		}
		setLoading(false);
	}

	// getAccountDetails
	const getAccountDetails = async () => {
		const filteredAccount = await filterAccount(accountId)
		setSelectChangeData((old) => ({ ...old, 'account_id': filteredAccount }))
	}

	useEffect(() => {
		fetchOnLoad();
		getInpersonData();
		getAccountDetails();
		fetchcourseTime();
	}, [])

	const formatDateForDisplay = (dateString) => {
		if (!dateString) return ''; // handle the case when dateString is undefined or null

		const date = new Date(dateString);
		const month = (1 + date.getMonth()).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		const year = date.getFullYear();

		// Format the date as "MM/DD/YYYY"
		// return `${month}-${day}-${year}`;
		return `${year}-${month}-${day}`;
	};


	const handleDateChange = (fieldName, date) => {
		// const formattedDate = date ? date.toLocaleDateString('en-US') : '';
		const formattedDate = date ? FormatDate(date) : '';

		setFormData({
			...formData,
			[fieldName]: formattedDate,
		});
	};


	const handleTimeChanges = (event, fieldName) => {
		// Extract the updated time value from the event
		const newTimeValue = event.target.value;
		setFormData({
			...formData,
			[fieldName]: newTimeValue,
		});
	};

	console.log('formDataNew', formData);


	return (
		<>
		{loading ?
			<>
			  <div className="showloading">
				<Loading />
			  </div>
			</>
			  :
		<div>
			<div className='' style={{ paddingInline: "45px" }}>
				<div className="sub-heading-top mt-3">
					<SubHeadingOther title="Edit Inperson Class" hideNew={true} hideHierarchy={true} hideInstructor={true} subHeading={true} />
				</div>

				<Form
					className=""
					onSubmit={handleSubmit}
					noValidate
					validated={validated}
					id="create-new-class-form"
				>

					{/* account information */}
					<div
						className="container-fluid py-2 pb-4 px-2 my-3"
						style={{
							borderBottom: "4px solid rgb(13, 110, 253)",
							background: "#eee",
						}}
					>
						<h2 className="heading">Account Information</h2>
						<div className="row">
							<div className="col-md-4">
								<div className="row">

									<Form.Group className={"col"}>
										<Form.Label>Account*</Form.Label>
										<Select
											value={selectChangeData?.account_id}
											options={allAccounts}
											onChange={(data) => { handleSelectChange(data, 'account_id'); fetchSites(data.value) }}
										/>
									</Form.Group>

									<Form.Group className={"col"}>
										<Form.Label>Site*</Form.Label>
										<Select
											className={validatedField.site_id ? 'invalid-select' : ''}
											value={selectChangeData?.site_id}
											options={allSites}
											onChange={(data) => { handleSelectChange(data, 'site_id'); fetchSiteAddress(data.value) }}
										/>
										{validatedField.site_id && (
											<div className="invalid">This field is required</div>
										)}
									</Form.Group>
								</div>
							</div>

							<div className="col-md-4">
								<Form.Group className={"col"}>
									<div className="d-flex justify-content-between align-items-center">
										<Form.Label>Training Address*</Form.Label>
										{formData?.account_id && formData?.site_id && (
											<button type='button' className="btn text-primary d-flex align-items-center" style={{ padding: 0 }} onClick={() => setAddressModal(true)}>
												<img src="/add.svg" alt="add" style={{ maxWidth: '15px' }} />
												<span className='ms-1'>New</span>
											</button>
										)}

									</div>
									<Select
										className={validatedField.training_address_id ? 'invalid-select' : ''}
										value={selectChangeData?.training_address_id}
										options={allAddress}
										onChange={(data) => { handleSelectChange(data, 'training_address_id') }}
									/>
									{validatedField.training_address_id && (
										<div className="invalid">This field is required</div>
									)}
								</Form.Group>
							</div>

							<div className="col-md-4">
								<div className="row">
									<Form.Group className={"col"}>
										<Form.Label>Room Name</Form.Label>
										<Form.Control
											type="text"
											name="room_name"
											// required
											onChange={(e) => handleInputChange(e)}
											value={formData?.room_name}
										/>
									</Form.Group>

									<Form.Group className={"col"}>
										<Form.Label>Room Number</Form.Label>
										<Form.Control
											type="number"
											name="room_number"
											// required
											onChange={(e) => handleInputChange(e)}
											value={formData?.room_number}
										/>
									</Form.Group>
								</div>
							</div>
						</div>

					</div>

					{/* address modal */}
					{addressModal && (
						<TrainingAddressModal addressModal={addressModal} setAddressModal={setAddressModal} title="Add New Training Address" accountId={formData?.account_id} siteId={formData?.site_id} />
					)}

					{/* course information */}
					<div
						className="container-fluid py-2 pb-4 px-2 my-3"
						style={{
							background: "#eee",
							borderBottom: "4px solid rgb(13, 110, 253)",
						}}
					>
						<h2 className="heading">Course Information</h2>
						<div className="row">
							<div className="col-md-6">
								<div className="row">
									<Form.Group className={"col"}>
										<Form.Label>Cert Agency*</Form.Label>
										<Select
											className={validatedField.cert_agency ? 'invalid-select' : ''}
											value={selectChangeData?.cert_agency}
											options={allCertAgency}
											onChange={(data) => { handleSelectChange(data, 'cert_agency'); fetchCartCourses(data.value) }}
										/>
										{validatedField.cert_agency && (
											<div className="invalid">This field is required</div>
										)}
									</Form.Group>

									<Form.Group className={"col"}>
										<Form.Label>Course*</Form.Label>
										<Select
											className={validatedField.course ? 'invalid-select' : ''}
											value={selectChangeData?.course}
											options={allCourses}
											onChange={(data) => { handleSelectChange(data, 'course') }}
										/>
										{validatedField.course && (
											<div className="invalid">This field is required</div>
										)}
									</Form.Group>
								</div>
							</div>
							<div className="col-md-6">
								<div className="row">
									<Form.Group className={"col-2"}>
										<b className={""}>Public</b>
										<div className="">
											<FormControlLabel
												className={""}
												label=""
												control={
													<Switch
														checked={formData?.public == 1 || formData.public ? true : false}
														color="primary"
														size="medium"
														name="public"
														value={true}
														onChange={(e) => handleInputChange(e)}
													/>
												}
											/>
										</div>
									</Form.Group>

									<Form.Group className={"col-2"}>
										<b className={""}>Skills Check</b>
										<div className="">
											<FormControlLabel
												className={""}
												label=""
												control={
													<Switch
														checked={formData?.skills_check == 1 || formData.skills_check ? true : false}
														color="primary"
														size="medium"
														name="skills_check"
														value={true}
														onChange={(e) => handleInputChange(e)}
													/>
												}
											/>
										</div>
									</Form.Group>

									<Form.Group className={"col-3"}>
										<b className={""}>Keycodes</b>
										<div className="">
											<FormControlLabel
												className={""}
												label=""
												control={
													<Switch
														checked={formData?.keycodes_applied == 1 || formData.keycodes_applied ? true : false}
														color="primary"
														size="medium"
														name="keycodes_applied"
														value={true}
														onChange={(e) => handleInputChange(e)}
													/>
												}
											/>
										</div>
									</Form.Group>

									<Form.Group className={"col-2"}>
										<b className={""}>Package</b>
										<div className="">
											<FormControlLabel
												className={""}
												label=""
												control={
													<Switch
														checked={formData?.package == 1 || formData.package ? true : false}
														color="primary"
														size="medium"
														name="package"
														value={true}
														onChange={(e) => handleInputChange(e)}
													/>
												}
											/>
										</div>
									</Form.Group>
								</div>
							</div>
						</div>

					</div>

					{/* Class Occupancy Information */}
					<div
						className="container-fluid py-2 pb-4 px-2 my-3"
						style={{
							background: "#eee",
							borderBottom: "4px solid rgb(13, 110, 253)",
						}}
					>
						<h2 className="heading">Class Occupancy Information</h2>
						<div className="row">
							<Form.Group className={"col-2"}>
								<Form.Label>Expected*</Form.Label>
								<Form.Control
									type="number"
									name="expected_students"
									required
									onChange={(e) => handleInputChange(e)}
									value={formData?.expected_students}
								/>
								<Form.Control.Feedback type="invalid">
									Please Expected Student.
								</Form.Control.Feedback>
							</Form.Group>

							<Form.Group className={"col-2"}>
								<Form.Label>Minimum*</Form.Label>
								<Form.Control
									type="number"
									name="min_student"
									required
									onChange={(e) => handleInputChange(e)}
									value={formData?.min_student}
								/>
								<Form.Control.Feedback type="invalid">
									Please Minimum Student.
								</Form.Control.Feedback>
							</Form.Group>

							<Form.Group className={"col-2"}>
								<Form.Label>Maximum*</Form.Label>
								<Form.Control
									type="number"
									name="max_student"
									required
									onChange={(e) => handleInputChange(e)}
									value={formData?.max_student}
								/>

								<Form.Control.Feedback type="invalid">
									Please Maximum Student.
								</Form.Control.Feedback>
							</Form.Group>

							<Form.Group className={"col-2"}>
								<Form.Label>Student Price*</Form.Label>
								<Form.Control
									type="text"
									name="student_price"
									placeholder='$'
									required
									onChange={(e) => handleInputChange(e)}
									value={formData?.student_price}
								/>
								<Form.Control.Feedback type="invalid">
									Please Student Price.
								</Form.Control.Feedback>
							</Form.Group>


						</div>

					</div>

					{/* Schedule Information */}
					<div
						className="container-fluid py-2 pb-4 px-2 my-3"
						style={{
							background: "#eee",
							borderBottom: "4px solid rgb(13, 110, 253)",
						}}
					>
						<h2 className="heading">Schedule Information</h2>
						<div className="row">
							<Form.Group className={"col"}>
								<Form.Label>Course Date*</Form.Label>
								<div className={validatedField.course_date ? 'd-flex align-items-center calendar-input-btn invalid-datepicker-div' : 'd-flex align-items-center calendar-input-btn'}>
									{/* <LocalizationProvider dateAdapter={ AdapterDayjs }>
										<Stack spacing={ 3 }>
											<DesktopDatePicker
												label=""
												// inputFormat="MM/DD/YYYY"
												components={ {
													OpenPickerIcon: calendarIcon,
												} }
												minDate={new Date()}
												value={ formData?.course_date }
												onChange={ (newValue) => handleCalendarChange(newValue, 'course_date') }
												renderInput={ (params) => <TextField className='form-control' { ...params } error={ false } /> }
											/>
										</Stack>
									</LocalizationProvider> */}

									<CommonDatePicker
										calName={"course_date"}
										CalVal={formData?.course_date ? FormatDate(formData.course_date) : null}
										HandleChange={(name, val) =>
											handleDateChange(name, val)
										}
										disabled={false}
									/>

								</div>
								{validatedField.course_date && (
									<div className="invalid">This field is required</div>
								)}
							</Form.Group>

							<Form.Group className={"col"}>
								<Form.Label>Course Time*</Form.Label>
								<div className={validatedField.course_time ? 'd-flex align-items-center calendar-input-btn invalid-datepicker-div' : 'd-flex align-items-center calendar-input-btn'}>
									{/* <LocalizationProvider dateAdapter={ AdapterDayjs }>
										<Stack spacing={ 3 }>
											<TimePicker
												ampm={ true }
												// openTo="hours"
												// views={ [ 'hours', 'minutes', 'seconds' ] }
												// inputFormat="HH:mm:ss"
												components={ {
													OpenPickerIcon: timeIcon,
												}}
												minDate={new Date().setHours(9, 0, 0, 0)}
												value={courseTime}
												onChange={ (newValue) => handleTimeChange(newValue, 'course_time') }
												renderInput={ (params) => <TextField className='form-control' { ...params } error={ false } /> 
											}
											/>
										</Stack>
									</LocalizationProvider> */}
									<input
										type='time'
										value={formData?.course_time}
										onChange={(e) => handleTimeChanges(e, 'course_time')}
									/>
								</div>
								{validatedField.course_time && (
									<div className="invalid">This field is required</div>
								)}
							</Form.Group>

							<Form.Group className={"col"}>
								<Form.Label>Registration Close Date</Form.Label>
								<div className="d-flex align-items-center calendar-input-btn">
									{/* <LocalizationProvider dateAdapter={ AdapterDayjs }>
										<Stack spacing={ 3 }>
											<DesktopDatePicker
												label=""
												// inputFormat="MM/DD/YYYY"
												components={ {
													OpenPickerIcon: calendarIcon,
												} }
												minDate={new Date()}
												value={ formData?.registration_close_date }
												onChange={ (newValue) => handleCalendarChange(newValue, 'registration_close_date') }
												renderInput={ (params) => <TextField className='form-control' { ...params } error={ false } /> }
											/>
										</Stack>
									</LocalizationProvider> */}

									<CommonDatePicker
										calName={"registration_close_date"}
										CalVal={formData?.registration_close_date ? FormatDate(formData.registration_close_date) : null}
										HandleChange={(name, val) =>
											handleDateChange(name, val)
										}
										disabled={false}
									/>

								</div>
							</Form.Group>

							<Form.Group className={"col"}>
								<Form.Label>Registration Close Time</Form.Label>
								<div className="d-flex align-items-center calendar-input-btn">
									{/* <LocalizationProvider dateAdapter={ AdapterDayjs }>
										<Stack spacing={ 3 }>
											<TimePicker
												label=""
												// inputFormat="HH:mm:ss"
												components={ {
													OpenPickerIcon: timeIcon,
												} }
												value={ registrationTime }
												onChange={ (newValue) => handleRegistrationTimeChange(newValue, 'registration_close_time') }
												renderInput={ (params) => <TextField className='form-control' { ...params } error={ false } /> }
											/>
										</Stack>
									</LocalizationProvider> */}
									<input
										type='time'
										value={formData?.registration_close_time}
										onChange={(e) => handleTimeChanges(e, 'registration_close_time')}
									/>
								</div>
							</Form.Group>

							<Form.Group className={"col"}>
								<Form.Label>Instructors Needed*</Form.Label>
								<Form.Control
									type="text"
									name="instructors_needed"
									required
									onChange={(e) => handleInputChange(e)}
									value={formData?.instructors_needed}
								/>
								<Form.Control.Feedback type="invalid">
									This field is required.
								</Form.Control.Feedback>
							</Form.Group>

							<Form.Group className={"col"}>
								<Form.Label>Hours</Form.Label> <br />
								<Form.Label>({formData?.course_length})</Form.Label>
							</Form.Group>

						</div>

					</div>

					{/* Parking Information */}
					<div
						className="container-fluid py-2 pb-4 px-2 my-3"
						style={{
							background: "#eee",
							borderBottom: "4px solid rgb(13, 110, 253)",
						}}
					>
						<h2 className="heading">Parking Information</h2>
						<div className="row">
							<div className="col-md-4">
								<div className="row">
									<Form.Group className={"col"}>
										<Form.Label>Parking Fee</Form.Label>
										<Form.Control
											type="text"
											name="parking_fee"
											placeholder='$'
											// required
											onChange={(e) => handleInputChange(e)}
											value={formData?.parking_fee}
										/>
									</Form.Group>

									<Form.Group className={"col"}>
										<b className={""}>Loading Dock</b>
										<div className="">
											<FormControlLabel
												className={""}
												label=""
												control={
													<Switch
														checked={formData?.loading_dock == 1 || formData?.loading_dock ? true : false}
														color="primary"
														size="medium"
														name="loading_dock"
														value={true}
														onChange={(e) => handleInputChange(e)}
													/>
												}
											/>
										</div>
									</Form.Group>

									<Form.Group className={"col"}>
										<b className={""}>Onsite Parking</b>
										<div className="">
											<FormControlLabel
												className={""}
												label=""
												control={
													<Switch
														checked={formData?.onsite_parking == 1 || formData?.onsite_parking ? true : false}
														color="primary"
														size="medium"
														name="onsite_parking"
														value={true}
														onChange={(e) => handleInputChange(e)}
													/>
												}
											/>
										</div>
									</Form.Group>

								</div>
							</div>

							<div className="col-md-4">
								<Form.Group className="col">
									<Form.Label>Special Parking Instructions</Form.Label>
									<Form.Control
										as="textarea"
										rows={3}
										name="special_parking_instructions"
										onChange={(e) => handleInputChange(e)}
										value={formData?.special_parking_instructions}
									/>
								</Form.Group>
							</div>

							<div className="col-md-4">
								<Form.Group className="col">
									<Form.Label>Sign-In / Security Procedures</Form.Label>
									<Form.Control
										as="textarea"
										rows={3}
										name="security_procedures"
										onChange={(e) => handleInputChange(e)}
										value={formData?.security_procedures}
									/>
								</Form.Group>
							</div>

						</div>

					</div>

					{/* AV Information and AED  Information */}
					<div
						className="container-fluid py-2 pb-4 px-2 my-3"
						style={{
							background: "#eee",
							borderBottom: "4px solid rgb(13, 110, 253)",
						}}
					>
						<div className="row">
							<div className="col-md-6">
								<h2 className="heading">AV Information</h2>
								<div className="row">
									<Form.Group className={"col"}>
										<b className={""}>TV / Projector</b>
										<div className="">
											<FormControlLabel
												className={""}
												label=""
												control={
													<Switch
														checked={formData?.tv_projector == 1 || formData?.tv_projector ? true : false}
														color="primary"
														size="medium"
														name="tv_projector"
														value={true}
														onChange={(e) => handleInputChange(e)}
													/>
												}
											/>
										</div>
									</Form.Group>

									<Form.Group className={"col"}>
										<b className={""}>DVD / Computer</b>
										<div className="">
											<FormControlLabel
												className={""}
												label=""
												control={
													<Switch
														checked={formData?.dvd_computer == 1 || formData?.dvd_computer ? true : false}
														color="primary"
														size="medium"
														name="dvd_computer"
														value={true}
														onChange={(e) => handleInputChange(e)}
													/>
												}
											/>
										</div>
									</Form.Group>

									<Form.Group className={"col"}>
										<b className={""}>Speaker System</b>
										<div className="">
											<FormControlLabel
												className={""}
												label=""
												control={
													<Switch
														checked={formData?.speaker_system == 1 || formData?.speaker_system ? true : false}
														color="primary"
														size="medium"
														name="speaker_system"
														value={true}
														onChange={(e) => handleInputChange(e)}
													/>
												}
											/>
										</div>
									</Form.Group>

								</div>

							</div>

							<div className="col-md-6">
								<AedComponent mode={'edit'} aedData={aedData} setAedData={setAedData} />
							</div>

						</div>

					</div>

					{/* Class Contacts */}
					<div
						className="container-fluid py-2 px-2 mt-3"
					>
						<h2 className="heading">Class Contacts</h2>
						<button className='btn text-primary' type='button' style={{ padding: 0 }} onClick={() => setContactShowModel(true)}>
							<img src="/edit.svg" alt="svg" style={{ marginRight: '5px' }} />
							<span className="ms-2">Contacts</span>
						</button>

						{/* modal */}
						<InpersonContactModel
							ShowModal={contactShowModel}
							SetShowModal={setContactShowModel}
							classContacts={classContacts}
							setClassContacts={setClassContacts}
							contactRepsList={contactRepsList}
							setContactRepsList={setContactRepsList}
						/>

						{/* table */}
						<div className="data-table py-3 col-md-7">
							<table className="w-100 border-gray">
								<thead>
									<tr className="">
										<th scope='col' width="33%" className=" py-2 px-2 bg-tbl-border border-r-blue">Training Site Coordinator </th>
										<th scope='col' width="33%" className=" py-2 px-2 bg-tbl-border border-r-blue">Instructor Contact Primary</th>
										<th scope='col' width="33%" className=" py-2 px-2 bg-tbl-border">Billing Contact</th>
									</tr>
								</thead>
								<tbody className="odd-even-row">
									<tr className="">
										<td className="py-2 px-2 tbl-border border-r-blue">
											<div className="d-flex align-items-center">
												<span className='me-2'>Primary: {classContacts?.training_site_cordinator?.primary_name}</span>
											</div>
										</td>
										<td className="py-2 px-2 tbl-border border-r-blue">
											<div className="d-flex align-items-center">
												<span className='me-2'>Primary: {classContacts?.instructor_contact?.primary_name}</span>
											</div>
										</td>
										<td className=" py-2 px-2 tbl-border">
											<div className="d-flex align-items-center">
												<span className='me-2'>Primary: {classContacts?.billing_contact?.primary_name}</span>
											</div>
										</td>
									</tr>
									<tr className="">
										<td className="py-2 px-2 tbl-border border-r-blue">
											<div className="d-flex align-items-center">
												<span className='me-2'>Backup: {classContacts?.training_site_cordinator?.backup_name}</span>
											</div>
										</td>
										<td className=" py-2 px-2 tbl-border border-r-blue">
											<div className="d-flex align-items-center">
												<span className='me-2'>Backup: {classContacts?.instructor_contact?.backup_name}</span>
											</div>
										</td>
										<td className=" py-2 px-2 tbl-border">
											<div className="d-flex align-items-center">
												<span className='me-2'>Backup: {classContacts?.billing_contact?.backup_name}</span>
											</div>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					{/* Tentative Class Details */}
					{classes?.length > 0 && (
						<div className="container-fluid py-2 pb-4 px-2">
							<h4 className='heading mt-1'>Tentative Class Details</h4>
							{/* table */}
							<table className="w-100 border-b-blue">
								<thead>
									<tr className="">
										<th className=" py-1 px-2 bg-tbl-border border-t-blue border-r-blue">Class</th>
										<th className=" py-1 px-2 bg-tbl-border border-t-blue border-r-blue">Date/Time Option 1</th>
										<th className=" py-1 px-2 bg-tbl-border border-t-blue border-r-blue">Date/Time Option 2</th>
										<th className=" py-1 px-2 bg-tbl-border border-t-blue">Date/Time Option 3</th>
									</tr>
								</thead>
								<tbody>
									{classes.map((classDetail, index) => (
										<tr className="" key={index}>
											<td className=" py-1 px-2 border-r-blue">
												{index + 1}
											</td>
											<td className=" py-1 px-2 border-r-blue">
												{classDetail?.date_time_option_1}
												<FormControlLabel
													className={"ms-2"}
													label=""
													control={
														<Switch
															checked={classDetail?.is_primary == 1 ? true : false}
															color="primary"
															size="medium"
															value={true}
															name="is_primary"
															onChange={(e) => { handleClassInputChange(e, index, 1) }}
														/>
													}
												/>
											</td>
											<td className=" py-1 px-2 border-r-blue">
												{classDetail?.date_time_option_2}
												<FormControlLabel
													className={"ms-2"}
													label=""
													control={
														<Switch
															checked={classDetail?.is_primary == 2 ? true : false}
															color="primary"
															size="medium"
															value={true}
															name="is_primary"
															onChange={(e) => { handleClassInputChange(e, index, 2) }}
														/>
													}
												/>
											</td>
											<td className=" py-1 px-2 border-r-blue">
												{classDetail?.date_time_option_3}
												<FormControlLabel
													className={"ms-2"}
													label=""
													control={
														<Switch
															checked={classDetail?.is_primary == 3 ? true : false}
															color="primary"
															size="medium"
															value={true}
															name="is_primary"
															onChange={(e) => { handleClassInputChange(e, index, 3) }}
														/>
													}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{/* Covid Restrictions */}
					<div
						className="container-fluid py-2 pb-4 px-2 my-3"
						style={{
							background: "#eee",
							borderBottom: "4px solid rgb(13, 110, 253)",
						}}
					>
						<div className="row">
							<div className="col-md-6">
								<h2 className="heading">Covid Restrictions</h2>
								<div className="row">
									<Form.Group className={"col"}>
										<b className={""}>Masks Required</b>
										<div className="">
											<FormControlLabel
												className={""}
												label=""
												control={
													<Switch
														checked={formData?.covid_restrictions_required == 1 || formData?.covid_restrictions_required ? true : false}
														color="primary"
														size="medium"
														name="covid_restrictions_required"
														value={true}
														onChange={(e) => handleInputChange(e)}
													/>
												}
											/>
										</div>
									</Form.Group>

									<Form.Group className="col-8">
										<Form.Label>Special Requirements</Form.Label>
										<Form.Control
											as="textarea"
											rows={4}
											name="covid_special_requirement_for_instructor"
											onChange={(e) => handleInputChange(e)}
											value={formData?.covid_special_requirement_for_instructor}
										/>
									</Form.Group>

								</div>
							</div>

							<div className="col-md-6">
								<h2 className="heading">Comments</h2>
								<Form.Group className="col-8">
									<Form.Label>Comments</Form.Label>
									<Form.Control
										as="textarea"
										rows={4}
										name="comments"
										onChange={(e) => handleInputChange(e)}
										value={formData?.comments}
									/>
								</Form.Group>
							</div>

						</div>

					</div>

					{/* General Information */}
					<div
						className="container-fluid py-2 pb-4 px-2 my-3"
						style={{
							background: "#eee",
							borderBottom: "4px solid rgb(13, 110, 253)",
						}}
					>
						<div className="row">
							<h2 className="heading">General Information</h2>
							<div className="row">
								<Form.Group className={"col-2"}>
									<Form.Label>Color Group</Form.Label>
									<Select
										value={selectChangeData?.color_group}
										options={allColorGroup}
										onChange={(value) => handleSelectChange(value, 'color_group')}
									/>

								</Form.Group>

								<Form.Group className={"col-2"}>
									<Form.Label>Status</Form.Label>
									<Select
										value={selectChangeData?.status}
										options={allClassStatus}
										onChange={(value) => handleSelectChange(value, 'status')}
									/>
								</Form.Group>

								{formData?.keycodes_applied == 1 || formData.keycodes_applied ?
									<>
										<Form.Group className="col-2">
											<Form.Label>Invoice Number</Form.Label>
											<Form.Control
												type="text"
												name="invoice_number"
												onChange={(e) => handleInputChange(e)}
												value={formData?.invoice_number}
											/>
										</Form.Group>

										<Form.Group className={"col-1"}>
											<b className={""}>Paid</b>
											<div className="">
												<FormControlLabel
													className={""}
													label=""
													control={
														<Switch
															checked={formData?.paid == 1 || formData?.paid ? true : false}
															color="primary"
															size="medium"
															name="paid"
															value={true}
															onChange={(e) => handleInputChange(e)}
														/>
													}
												/>
											</div>
										</Form.Group>

										<Form.Group className={"col-2"}>
											<b className={""}>Keycodes Sent</b>
											<div className="">
												<FormControlLabel
													className={""}
													label=""
													control={
														<Switch
															checked={formData?.keycodes_sent == 1 || formData?.keycodes_sent ? true : false}
															color="primary"
															size="medium"
															name="keycodes_sent"
															value={true}
															onChange={(e) => handleInputChange(e)}
														/>
													}
												/>
											</div>
										</Form.Group>
									</> : ''
								}

								{formData?.package == 1 || formData?.package ?
									<Form.Group className="col-3">
										<Form.Label>Package Tracking #</Form.Label>
										<Form.Control
											type="text"
											name="package_tracking"
											onChange={(e) => handleInputChange(e)}
											value={formData?.package_tracking}
										/>
									</Form.Group> : ''
								}

							</div>

						</div>

					</div>

					{/* alert msg */}
					<div className="my-4">
						<MessageHandler
							status={FormMsg.type}
							msg={FormMsg.msg}
							HandleMessage={setFormMsg}
						/>
					</div>

					{/* bottom buttons */}
					<div className="row my-4" >
						<div className="col-12 content-flex-right" >
							<button className="btn btn-danger text-uppercase" type="button" onClick={() => { navigate(-1) }}>Cancel</button>
							<button className="btn btn-success text-uppercase ms-2" type='submit'>Submit</button>
						</div>
					</div>

				</Form>
			</div>
		</div>
		}
		</>
	)
}
