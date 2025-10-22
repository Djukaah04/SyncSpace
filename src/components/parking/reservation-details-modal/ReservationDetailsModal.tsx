import React from "react";
import Modal from "../../../utils/modal/Modal";
import UserInfo from "../../../models/UserInfo";
import "./ReservationDetailsModal.scss";
import { formatDatePretty } from "../../../services/formattingService";

interface ReservationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserInfo;
  carPlate?: string;
  carUrl?: string;
  photoUrl?: string;
  displayName?: string;
  reservationEnd?: Date;
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  isOpen,
  onClose,
  user,
  carPlate,
  carUrl,
  photoUrl,
  displayName,
  reservationEnd,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="reservation-details-modal">
        <h2 className="reservation-details-modal__title">
          Reservation Details
        </h2>

        <div className="reservation-details-modal__content">
          <div
            className={`reservation-details-modal__left is-${user.role?.toLowerCase()}--short`}
          >
            {photoUrl && (
              <img
                className="reservation-details-modal__avatar"
                src={photoUrl}
                alt="user"
              />
            )}

            <div className="reservation-details-modal__row">
              <span className="reservation-details-modal__label">Name:</span>
              <span className="reservation-details-modal__value">
                {displayName || user.displayName}
              </span>
            </div>

            <div className="reservation-details-modal__row">
              <span className="reservation-details-modal__label">Email:</span>
              <span className="reservation-details-modal__value">
                {user.email || "-"}
              </span>
            </div>
            {reservationEnd && (
              <div className="reservation-details-modal__row">
                <span className="reservation-details-modal__label">
                  Reserved until:
                </span>
                <span className="reservation-details-modal__value reservation-details-modal__value--highlight">
                  {formatDatePretty(reservationEnd)}
                </span>
              </div>
            )}
          </div>

          {carUrl && (
            <div className="reservation-details-modal__right">
              <img
                className="reservation-details-modal__car-img"
                src={carUrl}
                alt="car"
              />
              <div className="reservation-details-modal__row">
                <span className="reservation-details-modal__label">Plate:</span>
                <span className="reservation-details-modal__value">
                  {carPlate || user.carPlate || "-"}
                </span>
              </div>
            </div>
          )}
        </div>

        <button
          className={`reservation-details-modal__close-btn reservation-details-modal__close-btn--${user.role?.toLowerCase()}`}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ReservationDetailsModal;
