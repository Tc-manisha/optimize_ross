import { useState, useEffect } from "react";
import {
  createRoutesFromElements,
  useNavigate,
  useParams,
} from "react-router-dom";
import Loading from "../Loading";

import CustomToggleButton2 from "../../../components/common/toggleSwitch/CustomToggle2";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import dayjs from "dayjs";
import Plus from "../../../img/Plus.svg";
import Minus from "../../../img/Minus.svg";
import Activitycheck from "../../../img/Activity Symbols.png";
import KingTaz from "../../../img/KingTaz.png";
import InventoryIcon from "../../../img/InventoryIcon.png";
import { MdOutlineArrowDropDown } from "react-icons/md";
import {
  Form,
  Button as BButton,
  Button as BsButton,
  InputGroup,
  Dropdown,
} from "react-bootstrap";
import TableSkeleton from "../skeleton/table/TableSkeleton";
import { CallGETAPI, CallGETAPINEW, CallPOSTAPI } from "../../../helper/API";
import { AiOutlineConsoleSql } from "react-icons/ai";
import { BiReset } from "react-icons/bi";
import {
  BatteryInfocolumnList,
  BatteryTypebyModel,
  DecryptToken,
  GetAedBrands,
  PadTypeByModal,
} from "../../../helper/BasicFn";
import SubHeadingOther from "../../../components/header/SubHeadingOther";
import { DataGrid } from "devextreme-react";
import NewAedBatteryRow from "./NewAedbatteryRow";
import NewAedPadRow from "./NewAedPadRow";
import SingleModiAed from "./AedmodificationComs/SingleModiAed";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { selecteTab } from "../../../redux/slices/TabSlice";
import PageLoader from "../../../components/loader/PageLoader";
import { FormatDate } from "../../../helper/Common";
import { useLocation } from "react-router-dom";

const AedServiceCheckService2 = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { serviceQuestionID } = useParams();
  const [formData, setFormData] = useState({
    Brand: "",
    Serial: "",
    Placement: "",
    AedReadyStatusToggle: 1,
    RecueKitToggle: [0],
    AlarmBatteryToggle: [0],
    ReplaceAccessoriesToggle: [0],
    SupportTicketToggle: [0],
    aedDataArray: [],
  });

  const location = useLocation()
  let isInventory = location?.state?.isInventory

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [validated, setValidated] = useState(false);
  const [serviceQuestionData, setServiceQuestionData] = useState({});
  // const [rmsBrandList, setBrandList] = useState([]);
  const [aedDetails, setAedDetails] = useState([]);
  const [showAdditionalBatteryRows, setShowAdditionalBatteryRows] =
    useState(false);
  const [showAdditionalPadsRows, setShowAdditionalPadsRows] = useState(false);
  const [batteryInfo, setBatteryInfo] = useState([]);
  const [padInfo, setPadInfo] = useState([]);
  const [selectedBatteryValue, setSelectedBatteryValue] = useState("");
  const [selectedPadiatricValue, setSelectedPadiatricValue] = useState("");
  const [batteryTypeList, setBatteryTypeList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [brandName, setBrandname] = useState([]);
  const [ShowEmptyMainBtryRow, setShowEmptyMainBtryRow] = useState(false);
  const [removedBatteryInfo, setRemovedBatteryInfo] = useState([]);
  const [removedSpareRows, setRemovedSpareRows] = useState([]);
  const [moveSpareBattery, setMoveSpareBattery] = useState(false);
  const [moveSpareBatteryIndex, setMoveSpareBatteryIndex] = useState([]);
  const [moveSpareToPadPadiatric, setMoveSpareToPadPadiatric] = useState(false);
  const [moveSpareToPadPadiatricIndex, setMoveSpareToPadPadiatricIndex] =
    useState();
  const [moveSpareToPad, setMoveSpareToPad] = useState(false);
  const [moveSpareToPadIndex, setMoveSpareToPadIndex] = useState();
  const [additionalBatteryRows, setAdditionalBatteryRows] = useState(0);
  const [additionalPadRows, setAdditionalPadRows] = useState(0);
  const [deleteNewBattery, setDeleteNewBattery] = useState(false);
  const [resetButton, setResetButton] = useState(false);
  const [resetPadButton, setResetPadButton] = useState(false);
  const [batteryList, setBatteryList] = useState([]);
  const [padList, setPadList] = useState([]);
  const [resetBtnLoading, setResetBtnLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const user = DecryptToken();
  const [newFormData, setNewFormData] = useState([
    {
      accessories_key: "AED",
      all_pads: [],
      default_all_pads: [],
      battery_info: [],
      default_battery_info: [],
      battery_section_name: "",
      deletedBatteried: [],
      deletedPads: [],
      deletedChargePak: [],
      RecueKitToggle: 0,
      AlarmBatteryToggle: 0,
      ReplaceAccessoriesToggle: 0,
      SupportTicketToggle: 0,
      AedReadyStatusToggle: 1,
      resetButton: 0,
      resetPadButton: 0,
      aedPadTypeList: [],
      battery_type_list: [],
      dni_array_list: [],
      charge_pak_arr: [],
      charge_pack_list: [],
    },
  ]);
  // const IsColumnVisible = (key, data) => {
  //   return data.some((row) => row[key] !== null && row[key] !== undefined);
  // };

  const [serialNumbersData, setSerialNumbersData] = useState([]);
  const [isPresentText, setIsPresentText] = useState("");
  const [presentError, setPresentError] = useState(false);
  const [contactId, setContactId] = useState("");

  var contact_id = serviceQuestionData?.contact_id;
  var inspection_by = serviceQuestionData?.inspection_by;

  const fetchSerialNumbers = async (Cid) => {
    var response = await CallGETAPI(`account/get-replacing-serial/${Cid}`);
    if (response.status === true) {
      var data = response?.data?.serialNumbers;
      setSerialNumbersData(data);
      console.log("data: ", data);
    }
  };



  const IsColumnVisible = (key, data) => {
    // console.log({key,data});
    if (key === "battery_serial") {
      return false;
    }
    return data.some((row) => isValidValue(row[key]));
  };

  const isValidValue = (value) => {
    // Add additional checks for specific invalid values
    return (
      value !== null &&
      value !== undefined &&
      value !== "0000-00-00" &&
      value != ""
    );
  };

  const fetchData = async () => {
    // setLoading(true);
    setPageLoading(true);
    const res = await CallGETAPI(
      `account/get-service-questions-by-id/${serviceQuestionID}`
    );
    if (res.status) {
      const serviceQuestions = res.data.service_questions;
      const AEDData = res.data.aed_data;
      // console.log(res.data.service_questions);
      // console.log({ serviceQuestions, AEDData });
      setServiceQuestionData(serviceQuestions);
      fetchSerialNumbers(serviceQuestions?.contact_id);
      // setContactId(serviceQuestions?.contact_id)

      const arr = [];
      for (let i = 0; i < AEDData.length; i++) {
        const element = AEDData[i];
        const aed_data = element.aed_data;
        const BiArr = element.battery_info.filter(
          (it) => it.section_name != "charge_pack"
        );

        const visibleColumns = BatteryInfocolumnList.filter((column) => {
          return column.is_default === 1 || IsColumnVisible(column.key, BiArr);
        });


        const ChargePackBattery = element.battery_info.filter(it => it.section_name == 'charge_pack');
        const ChargePackPadInfo = element.all_pads.filter(it => it.section_name == 'charge_pack');
        const ChargePackInfoArr = [];
        if (ChargePackBattery.length > 0) {
          for (let k2 = 0; k2 < ChargePackBattery.length; k2++) {
            const bCERow = ChargePackBattery[k2];
            const Pad1Info = ChargePackPadInfo.find((it) => Number(it.pid) === Number(bCERow.charge_pak_pad_1_id));
            const Pad2Info = ChargePackPadInfo.find((it) => Number(it.pid) === Number(bCERow.charge_pak_pad_2_id));
            const ChargePakObj = {
              battery_info: { ...bCERow },
              pad_1_info: { ...Pad1Info },
              pad_2_info: { ...Pad2Info },
              is_readonly: 0,
              is_new: 0,
              bid: bCERow.bid,
              p1id: bCERow.charge_pak_pad_1_id,
              p2id: bCERow.charge_pak_pad_2_id,
              aed_id: bCERow.aed_id,
            }
            console.log({ ChargePakObj });
            ChargePackInfoArr.push(ChargePakObj);
          }
        }


        const obj = {
          ...aed_data,
          accessories_key: "AED",
          all_pads: element.all_pads.filter(
            (it) => it.section_name != "charge_pack"
          ),
          default_all_pads: element.all_pads.filter(
            (it) => it.section_name != "charge_pack"
          ),
          battery_info: BiArr,
          default_battery_info: BiArr,
          battery_section_name: BiArr?.[0]?.section_name,
          batteryvisibleColumns: visibleColumns,
          charge_pak_info: element.battery_info.filter(it => it.section_name == 'charge_pack'),
          default_charge_pak_info: ChargePackInfoArr || [],//element.battery_info.filter(it => it.section_name == 'charge_pack'),
          charge_pak_pad_info: element.all_pads.filter(it => it.section_name == 'charge_pack'),
          charge_pack_list: ChargePackInfoArr || [],
          deletedBatteried: [],
          deletedPads: [],
          deletedChargePak: [],
          RecueKitToggle: 0,
          AlarmBatteryToggle: 0,
          ReplaceAccessoriesToggle: 0,
          SupportTicketToggle: 0,
          AedReadyStatusToggle: 1,
          resetButton: 0,
          resetPadButton: 0,
          aedPadTypeList: [],
          battery_type_list: [],
          dni_array_list: [],
          charge_pak_arr: [],
        };

        let res = await CallGETAPINEW(
          "account/ade-pad-type-by-model/" + aed_data?.aed_model_id
        );
        if (res.data.status) {
          obj.aedPadTypeList = res?.data?.data || [];
        }
        const BatteryRes = await BatteryTypebyModel(aed_data?.aed_model_id);
        obj.battery_type_list = BatteryRes || [];
        arr.push(obj);
      }
      setNewFormData(arr);
    }
    // setLoading(false); 
    setPageLoading(false);
  };

  // console.log('newFormData: ', newFormData)

  const brandListfn = async () => {
    let brandList = await GetAedBrands();
    setBrandList(brandList);
  };

  const fetchBatteryModel = async (aed_model_id) => {
    const BatteryRes = await BatteryTypebyModel(aed_model_id);
    if (BatteryRes) {
      setBatteryTypeList(BatteryRes);
    }
    if (aedDetails.length === 0) {
      return "";
    }
  };

  useEffect(() => {
    fetchData();

    // fetch Brand
    brandListfn();
  }, []);

  const finalFormaData = () => {
    const finalObject = [];
    newFormData.map((item, i) => {

      let aedPads = item?.all_pads
      aedPads.forEach(pad => {
        if (pad.is_spare === 0 && pad.is_pediatric === 1) {
          pad.section_name = "pediatric_pad_info";
        } else if (pad.is_spare === 1 && pad.is_pediatric === 0) {
          pad.section_name = "spare_adult_pad_info";
        } else if (pad.is_spare === 1 && pad.is_pediatric === 1) {
          pad.section_name = "spare_padric_pad_info";
        } else if (pad.is_spare === 0 && pad.is_pediatric === 0) {
          pad.section_name = "adult_pad_info";
        }
      });

      console.log('aedPadsNew', aedPads);

      const obj = {
        aed_id: item?.aed_id,
        account_id: item?.account_id,
        site_id: item?.site_id,
        aed_brand_id: item?.aed_brand_id,
        aed_model_id: item?.aed_model_id,
        sub_model_id: item?.sub_model_id,
        part_number: item?.part_number,
        serial_number: item?.serial_number,
        asset: item?.asset,
        other: item?.other,
        aed_image: item?.aed_image,
        placement: item?.placement,
        purchase_type: item?.purchase_type,
        purchase_date: item?.purchase_date,
        warranty_date: item?.warranty_date,
        no_spares_toggle: item?.no_spares_toggle,
        no_pediatric_toggle: item?.no_pediatric_toggle,
        RMS_toggle: item?.RMS_toggle,
        out_of_service_toggle: item?.out_of_service_toggle,
        rms_info: item?.rms_info,
        storage_info: item?.storage_info,
        battery_info: item?.battery_info,
        spare_battery_info: item?.spare_battery_info,
        charge_pack: item?.charge_pak_info,
        spare_charge_pak_info: item?.spare_charge_pak_info,
        adult_pad_info: item?.adult_pad_info,
        spare_adult_pad_info: item?.spare_adult_pad_info,
        adult_pad_pak_info: item?.adult_pad_pak_info,
        spare_adult_pad_pak_info: item?.spare_adult_pad_pak_info,
        pediatric_pad_info: item?.pediatric_pad_info,
        spare_padric_pad_info: item?.spare_padric_pad_info,
        pediatric_pak_pad_info: item?.pediatric_pak_pad_info,
        spare_padric_pak_pad: item?.spare_padric_pak_pad,
        gateway_info: item?.gateway_info,
        builtin_RMS_info: item?.builtin_RMS_info,
        pediatric_key: item?.pediatric_key,
        ready_status: item?.ready_status,
        expiration_date: item?.expiration_date,
        last_check: item?.last_check,
        last_service: item?.last_service,
        rms_check: item?.rms_check,
        created_by_id: item?.created_by_id,
        created_date: item?.created_date,
        modified_by_id: item?.modified_by_id,
        modified_date: item?.modified_date,
        active: item?.active,
        created_by: item?.created_by,
        modified_by: item?.modified_by,
        assign_user: item?.assign_user,
        all_pads: item?.all_pads,
        battery_section_name: item?.battery_section_name,
        deletedBatteried: item?.deletedBatteried,
        deletedPads: item?.deletedPads,
        deletedChargePak: item?.deletedChargePak,
        charge_pak_list: item.charge_pack_list,
        RecueKitToggle: item?.RecueKitToggle,
        AlarmBatteryToggle: item?.AlarmBatteryToggle,
        ReplaceAccessoriesToggle: item?.ReplaceAccessoriesToggle,
        SupportTicketToggle: item?.SupportTicketToggle,
        AedReadyStatusToggle: item?.AedReadyStatusToggle,
        resetButton: item?.resetButton,
        resetPadButton: item?.resetPadButton,
        dni_array_list: item?.dni_array_list,
        charge_pak_arr: item?.charge_pak_arr,
        brandName: item?.brandName,
        modalName: item?.modalName,
        support_description: item.support_description,

        out_of_service_info: [{
          replacement_aed_toggle: item?.ReplacingAeds,
          servicing_notes: item.servicing_notes,
          replaced_serial: item?.ReplacementAedId,
          replaced_serial_name: item?.ReplacementSerial,
          loaner_serial_id: item?.loanerAedId,
          loaner_serial_name: item?.loanerSerial,
          loaner_toggle: item?.loaner_toggle,
          loaner_serial: item?.loaner_serial,
        }],

        // replacement_aed_toggle: item?.ReplacingAeds,
        // servicing_notes: item.servicing_notes,
        // replacement_aed_id: item?.ReplacementAedId,
        // replacement_aed_serial: item?.ReplacementSerial,

        questions_id: serviceQuestionData.questions_id,
        inspection_by: serviceQuestionData.inspection_by,
        inspection_date: serviceQuestionData.inspection_date,
        contact_id: serviceQuestionData.contact_id,
      };
      finalObject.push(obj);
    });
    return finalObject;
  };


  const isPresentErrorFunc = (inputValue, index, name) => {
    var error = false;
    const Fd = [...newFormData];
    if (Fd[index].AedReadyStatusToggle === 0 && Fd[index][name] === "") {
      Fd[index].isPresentError = 1;
      error = true;
    }
    setNewFormData(Fd);
    return error;
  };

  const dispatch = useDispatch();

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   const FD = finalFormaData();
  //   const SendObj = { allAeds: FD };
  //   console.log({ SendObj });
  //   const result = await CallPOSTAPI(
  //     "account/save-aed-modification-data-v2/",
  //     SendObj
  //   );
  //   if (result?.status) {
  //     dispatch(selecteTab("Equipment"));
  //     toast.success("Service Modification Added  Successfully!");
  //     navigate(`/account-details/${newFormData[0]?.account_id}`);
  //   } else {
  //     toast.error(result?.msg);
  //   }
  //   setLoading(false);
  // };

  const handleSubmit = async (e) => {

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(true);
      e.preventDefault();
      e.stopPropagation();
      return false;
    } else {
      setValidated(false);
    }
    e.preventDefault();
    setLoading(true);
    setFormSubmitted(true);

    const FD = finalFormaData();
    const SendObj = { allAeds: FD };
    const result = await CallPOSTAPI(
      "account/save-aed-modification-data-v2/",
      SendObj
    );
    if (result?.status) {
      dispatch(selecteTab("Equipment"));
      toast.success("Service Modification Added  Successfully!");
      if(user?.user_type === 3) {
        navigate(`/user/Equipment/${newFormData[0]?.account_id}`);
      } else {
        navigate(`/account-details/${newFormData[0]?.account_id}`);
      }
    } else {
      toast.error(result?.msg);
    }
    setLoading(false);
  };


  const print_battery_part = (bid) => {
    let findName = batteryTypeList.find(
      (item) => parseInt(item?.battery_type_id) === parseInt(bid)
    );
    return findName?.battery_part_number || bid;
  };


  const alarmbatteryToggleChange = (index) => {

    let currentDate = new Date();
    const fd = [...newFormData];
    let storage_info_array;

    if (typeof fd[index].storage_info === 'string') {
      storage_info_array = JSON.parse(fd[index].storage_info);
    } else {
      storage_info_array = fd[index].storage_info;
    }

    if (storage_info_array[0].storage_type === '') {
      storage_info_array[0].alarmed = 1;
      storage_info_array[0].alarm_status = 1;
      storage_info_array[0].storage_type = 1;
    }

    storage_info_array[0].v9_Installed_Date = FormatDate(currentDate);
    let expiryDate = new Date(currentDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    storage_info_array[0].expiry_date = FormatDate(expiryDate);

    fd[index].storage_info = storage_info_array;

    setNewFormData(fd);
  };


  const handleToggleChange = (type, is_checked, index) => {
    const fd = [...newFormData];
    fd[index].isPresentError = 0;
    fd[index][type] = is_checked ? 1 : 0;
    setNewFormData(fd);

    if (type === 'AlarmBatteryToggle') {
      alarmbatteryToggleChange(index)
    }
  };

  const filterData = (arr, key, value) => {
    if (!arr) {
      return "";
    }
    const data = arr.find((a) => a[key] == value);
    return data;
  };

  const renderBrandName = (aed_brand_id, brandList) => {
    const filteredBrand = filterData(brandList.data, "id", aed_brand_id);
    return filteredBrand?.AED_brands;
  };
  return (
    <>
      {/* {loading && <div className="showloading"> <Loading /> </div>} */}

      <div
        className="mt-4 table-main-20002"
        style={{ width: "100%", paddingInline: "2%" }}
      >

        {pageLoading ? (
          <div className="showloading">
            <PageLoader />
          </div>
        ) : (
          // <form className="" onSubmit={handleSubmit}>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <SingleModiAed
              fetchBatteryModel={fetchBatteryModel}
              brandList={brandList}
              AedFormData={newFormData}
              serviceQuestionData={serviceQuestionData}
              handleToggleChange={handleToggleChange}
              renderBrandName={renderBrandName}
              setNewFormData={setNewFormData}
              print_battery_part={print_battery_part}
              padList={padList}
              setPresentError={setPresentError}
              presentError={presentError}
              setIsPresentText={setIsPresentText}
              isPresentText={isPresentText}
              contact_id={contact_id}
              inspection_by={inspection_by}
              serialNumbersData={serialNumbersData}
              isPresentErrorFunc={isPresentErrorFunc}
              isInventory={isInventory}
              accountId={newFormData[0]?.account_id}
              siteId={newFormData[0]?.site_id}
            />

            <div
              className="row pb-3 py-4"
              style={{ marginBottom: "6%", marginRight: "1%" }}
            >
              <div className="col-12 content-flex-right">
                <button
                  className="btn text-uppercase cancel-button"
                  type="button"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
                <button
                  className="btn text-uppercase ms-4 submit-button"
                  type="submit"
                //disabled={loading}
                >
                  {loading ? "Loading..." : "Submit"}
                </button>
              </div>
            </div>
          </Form>
          // </form>
        )}
      </div>
    </>
  );
};

export default AedServiceCheckService2;