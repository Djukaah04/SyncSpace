import React from "react";
import Modal from "../../../utils/modal/Modal";
import UserInfo from "../../../models/UserInfo";

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
        <h2>Reservation Details</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          {photoUrl && (
            <img
              src={photoUrl}
              alt="user"
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          )}
          <div>
            <b>Name:</b> {displayName || user.displayName}
          </div>
          {carUrl && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img
                src={carUrl}
                alt="car"
                style={{
                  width: 60,
                  height: 40,
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
              <span>
                <b>Car plate:</b> {carPlate || user.carPlate || "-"}
              </span>
            </div>
          )}
          <div>
            <b>Email:</b> {user.email || "-"}
          </div>
          {reservationEnd && (
            <div>
              <b>Reserved until:</b> {reservationEnd.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReservationDetailsModal;
